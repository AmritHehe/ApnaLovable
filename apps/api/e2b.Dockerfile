FROM e2bdev/code-interpreter:latest

# Set working directory
WORKDIR /home/user

# Install Vite (React + TS template)
RUN npm create vite@latest . -- --template react-ts && \
    npm install

# Install TailwindCSS and related dependencies
RUN npm install -D tailwindcss@3.3.3 postcss@8 autoprefixer@10 && \
    npx tailwindcss init -p

# Install React Router DOM, shadcn/ui components, and lucide-react
RUN npm install react-router-dom @shadcn/ui lucide-react

# Basic Tailwind setup: clear App.css & index.css and add Tailwind directives
RUN echo "@tailwind base;\n@tailwind components;\n@tailwind utilities;" > src/index.css && \
    echo "/* App CSS - cleared, you can add custom styles here */" > src/App.css

# Create a file that imports all shadcn components (for convenience)
RUN echo "/* Shadcn/UI imports */\n\
import { Button, Card, Input, Avatar, Checkbox, Dialog, Tabs, Badge, Switch, Select, Table } from '@shadcn/ui';" \
> src/shadcnImports.ts

# Create Vite config with React plugin and E2B allowed hosts
RUN echo "import { defineConfig } from 'vite'; \
import react from '@vitejs/plugin-react'; \
export default defineConfig({ \
  plugins: [react()], \
  server: { host: true, allowedHosts: ['.e2b.app'] } \
});" > vite.config.ts

# Expose Vite default port
EXPOSE 5173

# Run the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]
