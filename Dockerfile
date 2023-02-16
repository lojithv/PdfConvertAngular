FROM node:16.14.2 as build-step
WORKDIR /app
COPY package.json /app/
RUN yarn
COPY ./ /app/
RUN npm run build

# Get the compiled app ready to be served with Nginx
FROM nginx:1.17.1-alpine
COPY --from=build-step /app/dist/pdf-convert-angular/ /usr/share/nginx/html
