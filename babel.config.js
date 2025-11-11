module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [

      // --- CORREÇÃO AQUI ---
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            // O atalho "@" deve corresponder ao seu tsconfig.json
            "@": "./", // <-- OBRIGATÓRIO TER A BARRA!
          },
        },
      ],
      // --- FIM DA CORREÇÃO ---
    ],
  };
};