FROM e2bdev/code-interpreter:latest 

# Set working directory
WORKDIR /home/user

# Install Vite (React template) and TailwindCSS
RUN npm create vite@latest . -- --template react-ts && \
    npm install

RUN npm install -D tailwindcss@3.3.3 postcss@8 autoprefixer@10 && \
    npx tailwindcss init -p
    
RUN echo "import { defineConfig } from 'vite'; \
import react from '@vitejs/plugin-react'; \
export default defineConfig({ \
  plugins: [react()], \
  server: { host: true, allowedHosts: ['.e2b.app'] } \
});" > vite.config.ts


# Expose the Vite default port
EXPOSE 5173




# Run the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]