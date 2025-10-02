# Etapa 1: Construcción de la aplicación Angular
FROM node:18-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de dependencias e instalarlas
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del código fuente de la aplicación
COPY . .

# Construir la aplicación para producción
# Reemplaza 'mentoria-studio-web-portal' si el nombre de tu proyecto en angular.json es diferente
RUN npm run build -- --configuration production

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine

# Copiar los archivos construidos desde la etapa de 'build' al directorio de Nginx
# Reemplaza 'mentoria-studio-web-portal' si el nombre de tu proyecto es diferente
COPY --from=build /app/dist/mentoria-studio-web-portal/browser /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx para soportar el enrutamiento de Angular
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
