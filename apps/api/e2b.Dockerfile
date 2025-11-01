# Use Debian-based Node image (required for E2B provisioning)
FROM node:20-bullseye

# Set working directory
WORKDIR /home/user

# 1️⃣ Create new Vite + React + TypeScript app
RUN npm create vite@latest . -- --template react-ts && \
    npm install

# 2️⃣ Install Tailwind CSS v4 and plugin
RUN npm install tailwindcss @tailwindcss/vite

# 3️⃣ Configure Vite with Tailwind + React
RUN echo "import { defineConfig } from 'vite'; \
import react from '@vitejs/plugin-react'; \
import tailwindcss from '@tailwindcss/vite'; \
export default defineConfig({ \
  plugins: [react(), tailwindcss()], \
  server: { host: true, allowedHosts: ['.e2b.app'] } \
});" > vite.config.js

# 4️⃣ Add Tailwind imports to index.css
RUN echo '@import "tailwindcss";' > src/index.css

# 5️⃣ Create Tailwind config manually (v4 syntax)
RUN echo 'export default { \
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], \
  theme: { extend: {} }, \
  plugins: [] \
}' > tailwind.config.js

# 6️⃣ Install essential UI + utilities
RUN npm install lucide-react clsx tailwind-variants class-variance-authority @radix-ui/react-icons @radix-ui/react-slot

# 7️⃣ Install shadcn/ui
RUN npm install shadcn-ui

# 8️⃣ Install React Router DOM (with types)
RUN npm install react-router-dom && \
    npm install -D @types/react-router-dom

# 9️⃣ Expose Vite port
EXPOSE 5173

# 🔟 Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]
