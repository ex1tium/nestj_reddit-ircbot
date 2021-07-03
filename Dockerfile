
# https://dev.to/abbasogaji/how-to-dockerize-your-nestjs-app-for-production-2lmf

FROM node:15 AS builder
WORKDIR /app
COPY ./package.json ./
# RUN npm install -g yarn
RUN yarn install
COPY . .
RUN npm run build
RUN pwd



FROM node:15-alpine
WORKDIR /app
COPY --from=builder /app ./
CMD ["npm", "run", "start:prod"]

# --------------------------------------------------------------------------------------------- #


# # FROM node:12.19.0-alpine3.9 AS development
# FROM node:15 AS development

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install -g npm@latest
# RUN npm install -g glob rimraf

# # RUN npm install --only=development
# RUN yarn install

# COPY . .

# RUN npm run build
# RUN ls -l

# # FROM node:12.19.0-alpine3.9 as production
# FROM node:15 AS production

# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}

# WORKDIR /usr/src/app
# RUN ls -l

# # RUN npm install -g glob rimraf yarn

# COPY package*.json ./

# # RUN npm install --only=production
# RUN yarn install 


# COPY . .

# COPY --from=development /usr/src/app/dist ./dist
# RUN ls -l
# RUN pwd

# CMD ["node", "dist/main"]