import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Keyboard 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import * as Crypto from 'expo-crypto';

import { useTheme } from '../../theme';
import { getDB } from '../../database';
import BookItem from '../../components/BookItem'; 
import LoadingScreen from '../../components/LoadingScreen'; 

const LibraryScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newTotalPages, setNewTotalPages] = useState('');

  // 🛡️ Estilos Blindados
  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
        pageContainer: { flex: 1, paddingHorizontal: 16, backgroundColor: c.background },
        pageTitle: { fontSize: 28, fontWeight: 'bold', color: c.text, marginBottom: 20 },
        
        formContainer: { backgroundColor: c.card, padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: c.border },
        formTitle: { fontSize: 20, fontWeight: '600', color: c.primary, marginBottom: 12 },
        input: { backgroundColor: c.background, color: c.text, borderColor: c.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 12 },
        
        button: { backgroundColor: c.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
        buttonDisabled: { backgroundColor: c.primary, opacity: 0.6 },
        buttonText: { color: c.card, fontSize: 16, fontWeight: '600' },
        
        goalSection: { marginBottom: 20 },
        goalSectionTitle: { fontSize: 22, fontWeight: 'bold', color: c.primary, borderBottomColor: c.border, borderBottomWidth: 2, paddingBottom: 4, marginBottom: 12 },
        emptyText: { fontSize: 14, color: c.textSecondary, fontStyle: 'italic', marginTop: 8 },
    });
  }, [theme]);

  // --- LER LIVROS ---
  const loadBooks = useCallback(() => {
    try {
        const db = getDB();
        // Força a leitura atualizada
        const result = db.getAllSync('SELECT * FROM books ORDER BY title ASC');
        setBooks(result);
    } catch (e) { 
        console.error("Erro ao carregar livros:", e); 
    } finally { 
        setLoading(false); 
    }
  }, []);

  useFocusEffect(useCallback(() => { loadBooks(); }, [loadBooks]));

  // --- ADICIONAR LIVRO ---
  const handleAddBook = () => {
    if (!newTitle.trim()) return;
    
    setWriting(true);
    try {
      const db = getDB();
      const id = Crypto.randomUUID();
      
      const pages = parseInt(newTotalPages) || 0;

      // CORREÇÃO: Removidos os colchetes [] em volta dos parâmetros
      db.runSync(
        'INSERT INTO books (id, title, author, totalPages, status, currentPage) VALUES (?, ?, ?, ?, ?, ?)',
        id, 
        newTitle.trim(), 
        newAuthor.trim(), 
        pages, 
        'TO_READ', 
        0
      );
      
      setNewTitle(''); 
      setNewAuthor(''); 
      setNewTotalPages('');
      Keyboard.dismiss();
      
      loadBooks(); 
    } catch (e) { 
        console.error("Erro ao adicionar:", e); 
    } finally { 
        setWriting(false); 
    }
  };

  // --- ATUALIZAR LIVRO ---
  const updateBook = (bookId: string, updates: any) => {
    try {
        const db = getDB();
        
        if (updates.status) {
            // CORREÇÃO: Removidos os colchetes []
            db.runSync('UPDATE books SET status = ? WHERE id = ?', updates.status, bookId);
        }
        
        if (updates.currentPage !== undefined && !isNaN(Number(updates.currentPage))) {
             // CORREÇÃO: Removidos os colchetes []
            db.runSync('UPDATE books SET currentPage = ? WHERE id = ?', Number(updates.currentPage), bookId);
        }
        
        loadBooks(); 
    } catch (e) { 
        console.error("Erro ao atualizar:", e); 
    }
  };

  // --- DELETAR LIVRO ---
  const deleteBook = (bookId: string) => {
    try {
        const db = getDB();
        // CORREÇÃO: Removidos os colchetes []
        db.runSync('DELETE FROM books WHERE id = ?', bookId);
        loadBooks();
    } catch (e) { 
        console.error("Erro ao deletar:", e); 
    }
  };

  if (loading || !theme) {
    const safeTheme = theme || { background: '#fff', primary: '#333' } as any;
    return <LoadingScreen message="A carregar biblioteca..." theme={safeTheme} />;
  }

  const statusMap = { TO_READ: 'Para Ler', READING: 'Lendo', DONE: 'Lido' };

  return (
    <>
      <Stack.Screen options={{ title: 'Biblioteca', headerShown: false }} />
      <ScrollView 
        style={styles.pageContainer} 
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Biblioteca</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Novo Livro</Text>
          <TextInput style={styles.input} placeholder="Título" value={newTitle} onChangeText={setNewTitle} editable={!writing} placeholderTextColor={theme.textSecondary} />
          <TextInput style={styles.input} placeholder="Autor" value={newAuthor} onChangeText={setNewAuthor} editable={!writing} placeholderTextColor={theme.textSecondary} />
          <TextInput style={styles.input} placeholder="Total de Páginas" value={newTotalPages} onChangeText={setNewTotalPages} keyboardType="numeric" editable={!writing} placeholderTextColor={theme.textSecondary} />
          
          <TouchableOpacity style={[styles.button, writing ? styles.buttonDisabled : {}]} onPress={handleAddBook} disabled={writing}>
            {writing ? <ActivityIndicator color={theme.card} /> : <Text style={styles.buttonText}>Adicionar Livro</Text>}
          </TouchableOpacity>
        </View>

        {Object.entries(statusMap).map(([key, label]) => {
          const booksInCategory = books.filter(b => b.status === key);
          return (
            <View key={key} style={styles.goalSection}>
              <Text style={styles.goalSectionTitle}>{label} ({booksInCategory.length})</Text>
              {booksInCategory.length > 0 ? (
                booksInCategory.map(book => (
                  <BookItem 
                    key={book.id} 
                    book={book} 
                    onUpdate={updateBook} 
                    onDelete={() => deleteBook(book.id)} 
                    loading={writing} 
                    theme={theme} 
                  />
                ))
              ) : <Text style={styles.emptyText}>Nenhum livro nesta categoria.</Text>}
            </View>
          );
        })}
      </ScrollView>
    </>
  );
};

export default LibraryScreen;