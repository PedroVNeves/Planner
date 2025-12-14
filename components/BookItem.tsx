import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, ColorPalette } from '../theme';

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: 'TO_READ' | 'READING' | 'DONE';
  rating?: number;
}

interface BookItemProps {
  book: Book;
  onUpdate: (id: string, updates: Partial<Book>) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  theme?: ColorPalette;
}

const BookItem: React.FC<BookItemProps> = ({ book, onUpdate, onDelete, loading, theme: propTheme }) => {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;
  const styles = getDynamicStyles(theme);

  // Estado local para o input de páginas (evita lag ao digitar)
  const [localCurrentPage, setLocalCurrentPage] = useState(String(book.currentPage || 0));

  // Sincroniza se o livro mudar externamente
  useEffect(() => {
    setLocalCurrentPage(String(book.currentPage || 0));
  }, [book.currentPage]);

  const handleSavePage = () => {
    const pageNumber = parseInt(localCurrentPage);
    
    if (!isNaN(pageNumber)) {
      // Garante que a página está entre 0 e o total
      const maxPage = book.totalPages > 0 ? book.totalPages : 99999;
      const validPage = Math.min(Math.max(0, pageNumber), maxPage);
      
      if (validPage !== book.currentPage) {
          setLocalCurrentPage(String(validPage));
          
          // Lógica inteligente de status
          let newStatus = book.status;
          
          // Começou a ler? -> READING
          if (validPage > 0 && book.status === 'TO_READ') {
             newStatus = 'READING';
          }
          // Terminou? -> DONE
          if (book.totalPages > 0 && validPage >= book.totalPages) {
             newStatus = 'DONE';
          }

          onUpdate(book.id, {
            currentPage: validPage,
            status: newStatus
          });
      }
    } else {
        // Se digitou algo inválido, volta ao original
        setLocalCurrentPage(String(book.currentPage));
    }
  };

  const handleStatusChange = (newStatus: Book['status']) => {
    // Se marcar como LIDO, preenche as páginas automaticamente
    if (newStatus === 'DONE' && book.totalPages > 0) {
        onUpdate(book.id, { status: newStatus, currentPage: book.totalPages });
    } 
    // Se marcar como PARA LER, zera as páginas
    else if (newStatus === 'TO_READ') {
        onUpdate(book.id, { status: newStatus, currentPage: 0 });
    } 
    else {
        onUpdate(book.id, { status: newStatus });
    }
  };

  // Cálculo da porcentagem
  const percentage = (book.totalPages > 0 && book.currentPage > 0) 
    ? Math.min(100, Math.round((book.currentPage / book.totalPages) * 100)) 
    : 0;

  return (
    <View style={styles.bookItemContainer}>
      {/* Cabeçalho */}
      <View style={styles.bookHeader}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>{book.author ? `Por ${book.author}` : 'Autor desconhecido'}</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(book.id)} disabled={loading} style={styles.deleteButton}>
          <Feather name="trash-2" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Barra de Progresso */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
            {book.totalPages > 0 ? `${book.currentPage} / ${book.totalPages} pág` : `${book.currentPage} pág`}
        </Text>
        <Text style={styles.progressText}>{percentage}%</Text>
      </View>
      
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarForeground, { width: `${percentage}%` }]} />
      </View>

      {/* Controles */}
      <View style={styles.bookControls}>
        {/* Input de Página */}
        <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Pág:</Text>
            <TextInput
                style={styles.pageInput}
                value={localCurrentPage}
                onChangeText={setLocalCurrentPage}
                onBlur={handleSavePage}        
                onSubmitEditing={handleSavePage} 
                keyboardType="numeric"
                returnKeyType="done"
                editable={!loading}
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
            />
        </View>
        
        {/* Botões de Status */}
        <View style={styles.statusButtons}>
          <TouchableOpacity 
            onPress={() => handleStatusChange('TO_READ')} 
            style={[styles.statusBtn, book.status === 'TO_READ' && styles.activeStatusBtn]}
          >
            <Feather name="bookmark" size={18} color={book.status === 'TO_READ' ? theme.card : theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleStatusChange('READING')} 
            style={[styles.statusBtn, book.status === 'READING' && styles.activeStatusBtn]}
          >
            <Feather name="book-open" size={18} color={book.status === 'READING' ? theme.card : theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleStatusChange('DONE')} 
            style={[styles.statusBtn, book.status === 'DONE' && styles.activeStatusBtn]}
          >
            <Feather name="check-circle" size={18} color={book.status === 'DONE' ? theme.card : theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const getDynamicStyles = (colors: ColorPalette) => StyleSheet.create({
  bookItemContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000", shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, elevation: 2
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 2, flexWrap: 'wrap' },
  bookAuthor: { fontSize: 12, color: colors.textSecondary },
  deleteButton: { padding: 8, backgroundColor: '#fee2e2', borderRadius: 8 },
  
  progressContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  progressBarBackground: { backgroundColor: colors.border, height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 16 },
  progressBarForeground: { backgroundColor: colors.primary, height: 6, borderRadius: 3 },
  
  bookControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center' },
  inputLabel: { fontSize: 14, color: colors.textSecondary, marginRight: 6 },
  pageInput: {
    width: 70,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    backgroundColor: colors.background
  },
  
  statusButtons: { flexDirection: 'row', gap: 8 },
  statusBtn: { 
    padding: 8, 
    borderRadius: 8, 
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  activeStatusBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  }
});

export default BookItem;