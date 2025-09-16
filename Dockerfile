FROM node:18-alpine AS build-frontend
WORKDIR /app
COPY package.json package-lock.json ./
COPY src/front ./src/front
RUN npm ci --prefer-offline --no-audit --no-fund
RUN npm --prefix src/front run build

FROM python:3.11-slim
WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y build-essential gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY requirements.txt ./
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

# Copy app source
COPY . /app

# Copy built frontend assets into place
RUN mkdir -p /app/src/dist
COPY --from=build-frontend /app/src/front/dist /app/dist

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/src

EXPOSE 8080

CMD ["gunicorn", "wsgi:app", "--chdir", "./src", "-b", "0.0.0.0:8080", "--workers", "3", "--access-logfile", "-", "--error-logfile", "-"]
