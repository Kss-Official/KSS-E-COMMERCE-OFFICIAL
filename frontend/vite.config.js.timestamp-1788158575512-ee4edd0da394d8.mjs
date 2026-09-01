// vite.config.js
import { defineConfig } from "file:///C:/Users/HP/OneDrive/Desktop/NEW-BUYZO/KSS-E-COMMERCE-OFFICIAL/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/HP/OneDrive/Desktop/NEW-BUYZO/KSS-E-COMMERCE-OFFICIAL/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/HP/OneDrive/Desktop/NEW-BUYZO/KSS-E-COMMERCE-OFFICIAL/frontend/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("lucide-react")) {
              return "icons";
            }
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            return "vendor";
          }
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIUFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXE5FVy1CVVlaT1xcXFxLU1MtRS1DT01NRVJDRS1PRkZJQ0lBTFxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcSFBcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxORVctQlVZWk9cXFxcS1NTLUUtQ09NTUVSQ0UtT0ZGSUNJQUxcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0hQL09uZURyaXZlL0Rlc2t0b3AvTkVXLUJVWVpPL0tTUy1FLUNPTU1FUkNFLU9GRklDSUFML2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcclxuICBidWlsZDoge1xyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxNTAwLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdsdWNpZGUtcmVhY3QnKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiAnaWNvbnMnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QnKSB8fCBpZC5pbmNsdWRlcygncmVhY3QtZG9tJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1yZWFjdCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3InO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVosU0FBUyxvQkFBb0I7QUFDcGIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBR3hCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBQUEsRUFDaEMsT0FBTztBQUFBLElBQ0wsdUJBQXVCO0FBQUEsSUFDdkIsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sYUFBYSxJQUFJO0FBQ2YsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLGdCQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0IscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksR0FBRyxTQUFTLE9BQU8sS0FBSyxHQUFHLFNBQVMsV0FBVyxHQUFHO0FBQ3BELHFCQUFPO0FBQUEsWUFDVDtBQUNBLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
