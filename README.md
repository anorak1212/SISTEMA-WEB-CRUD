# Sistema de Gestión

> Aplicación web de punto de venta para una tienda de electrónica, desarrollada con PHP 8.2 + Apache y PostgreSQL, completamente contenerizada con Docker y Docker Compose. Permite gestionar productos, clientes y ventas mediante un CRUD completo, con arquitectura multi-contenedor, redes personalizadas y volúmenes persistentes.

---

## Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Asignaciones del Proyecto](#-asignaciones-del-proyecto)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Comandos Docker Esenciales](#-comandos-docker-esenciales)
  - [Contenedores](#contenedores)
  - [Volúmenes](#volúmenes)
  - [Redes](#redes)
- [Levantar Contenedores Manualmente](#-levantar-contenedores-manualmente)
  - [Contenedor de Base de Datos (PostgreSQL)](#1-contenedor-de-base-de-datos-postgresql)
  - [Contenedor Servidor Web (Apache + PHP)](#2-contenedor-servidor-web-apache--php)
  - [Comunicación entre Contenedores](#3-comunicación-entre-contenedores)
- [Redes en Docker](#-redes-en-docker)
  - [2 Contenedores en la Misma Red](#2-contenedores-en-la-misma-red)
  - [Contenedores en Redes Diferentes](#contenedores-en-redes-diferentes)
- [Docker Compose](#-docker-compose)
  - [Levantar con Docker Compose](#levantar-con-docker-compose)
  - [2 Contenedores en la Misma Red (Compose)](#2-contenedores-en-la-misma-red-compose)
  - [Contenedores en Redes Diferentes (Compose)](#contenedores-en-redes-diferentes-compose)
- [CRUD — Operaciones de la Aplicación](#-crud--operaciones-de-la-aplicación)
- [Base de Datos](#-base-de-datos)
- [Pasos para Levantar el Proyecto Completo](#-pasos-para-levantar-el-proyecto-completo)

---

## Descripción del Proyecto


---

## ✅ Asignaciones del Proyecto

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Página web (servidor en contenedor Docker) | ✅ |
| 2 | `docker-compose.yml` funcional | ✅ |
| 3 | Lista de comandos: contenedores, volúmenes, redes | ✅ (ver sección abajo) |
| 4 | Levantar contenedor de BD y contenedor Web | ✅ |
| 5 | Comunicación entre contenedores (misma red) | ✅ |
| 6 | Configuración equivalente con Docker Compose | ✅ |
| 7 | 2 contenedores en la misma red (comandos + compose) | ✅ |
| 8 | Agregar a 2 redes diferentes (comandos + compose) | ✅ |
| 9 | CRUD completo: Altas, Bajas, Cambios | ✅ |
| 10 | Mostrar todos los registros o solo uno | ✅ |
| 11 | Documento explicando los pasos | ✅ (este README) |
| 12 | Reporte de clientes que se dieron de alta | ✅ |
| 13 | CRUD de diferentes BDs (Productos, Clientes, Ventas) | ✅ |
| 14 | Registro de qué cliente compra qué producto | ✅ |

---

## Tecnologías Utilizadas

---

## 📁 Estructura del Proyecto

```



```

---

## Comandos Docker Esenciales

### Contenedores

```bash
# Ver todos los contenedores (activos e inactivos)
docker ps -a

# Ver solo los contenedores corriendo
docker ps

# Crear y correr un contenedor
docker run -d --name <nombre> <imagen>

# Detener un contenedor
docker stop <nombre_o_id>

# Iniciar un contenedor detenido
docker start <nombre_o_id>

# Reiniciar un contenedor
docker restart <nombre_o_id>

# Eliminar un contenedor (debe estar detenido)
docker rm <nombre_o_id>

# Eliminar un contenedor forzosamente (aunque esté corriendo)
docker rm -f <nombre_o_id>

# Ver logs de un contenedor
docker logs <nombre_o_id>

# Entrar a la terminal de un contenedor
docker exec -it <nombre_o_id> bash

# Ver información detallada de un contenedor
docker inspect <nombre_o_id>
```

### Volúmenes

```bash
# Listar todos los volúmenes
docker volume ls

# Crear un volumen
docker volume create <nombre_volumen>

# Inspeccionar un volumen
docker volume inspect <nombre_volumen>

# Eliminar un volumen
docker volume rm <nombre_volumen>

# Eliminar todos los volúmenes no usados
docker volume prune

# Usar un volumen al crear un contenedor
docker run -d --name <nombre> -v <nombre_volumen>:/ruta/en/contenedor <imagen>

# Montar una carpeta local (bind mount)
docker run -d --name <nombre> -v C:/ruta/local:/ruta/contenedor <imagen>
```

### Redes

```bash
# Listar redes
docker network ls

# Crear una red personalizada
docker network create <nombre_red>

# Crear red tipo bridge con subred personalizada
docker network create --driver bridge --subnet 172.20.0.0/16 <nombre_red>

# Inspeccionar una red
docker network inspect <nombre_red>

# Conectar un contenedor a una red
docker network connect <nombre_red> <nombre_contenedor>

# Desconectar un contenedor de una red
docker network disconnect <nombre_red> <nombre_contenedor>

# Eliminar una red (no debe tener contenedores activos)
docker network rm <nombre_red>

# Eliminar redes no usadas
docker network prune
```

---

## Levantar Contenedores Manualmente

### 1. Contenedor de Base de Datos (PostgreSQL)

```bash
# 1. Crear red personalizada
docker network create red_sysstore

# 2. Crear volumen para persistencia
docker volume create pgdata_sysstore

# 3. Levantar contenedor de PostgreSQL
docker run -d \
  --name db_sysstore \
  --network red_sysstore \
  -e POSTGRES_DB=sysstore \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -v pgdata_sysstore:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15
```

> En **PowerShell (Windows)** usar backtick `` ` `` en lugar de `\` para saltos de línea, o escribir todo en una sola línea.

```powershell
# PowerShell equivalente (una línea)
docker run -d --name db_sysstore --network red_sysstore -e POSTGRES_DB=sysstore -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -v pgdata_sysstore:/var/lib/postgresql/data -p 5432:5432 postgres:15
```

### 2. Contenedor Servidor Web (Apache + PHP)

```bash
# Construir la imagen desde el Dockerfile
docker build -t sysstore_web .

# Levantar contenedor web conectado a la misma red que la BD
docker run -d \
  --name web_sysstore \
  --network red_sysstore \
  -v ./src:/var/www/html \
  -p 8080:80 \
  sysstore_web
```

```powershell
# PowerShell equivalente
docker run -d --name web_sysstore --network red_sysstore -v ${PWD}/src:/var/www/html -p 8080:80 sysstore_web
```

### 3. Comunicación entre Contenedores

Cuando dos contenedores están en la **misma red Docker**, se pueden comunicar usando el **nombre del contenedor** como hostname.

En el archivo `db/conexion.php`, el host de la base de datos es el nombre del contenedor `db_sysstore`:

```php
<?php
$host    = "db_sysstore";   // <-- nombre del contenedor de BD
$port    = "5432";
$dbname  = "sysstore";
$user    = "admin";
$pass    = "admin123";

$dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
$pdo = new PDO($dsn, $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
```

> Docker resuelve automáticamente el nombre `db_sysstore` a la IP interna del contenedor. ¡No necesitas saber la IP!

---

## Redes en Docker

### 2 Contenedores en la Misma Red

```bash
# 1. Crear red
docker network create red_compartida

# 2. Crear contenedor 1 (BD)
docker run -d --name contenedor_bd --network red_compartida postgres:15

# 3. Crear contenedor 2 (Web)
docker run -d --name contenedor_web --network red_compartida mi_imagen_web

# 4. Verificar que están en la misma red
docker network inspect red_compartida
```

Ambos contenedores pueden comunicarse entre sí usando sus nombres como hostname.

---

### Contenedores en Redes Diferentes

En este escenario, el **servidor de BD** está en su propia red (`red_bd`) y el **servidor web** está en otra red (`red_web`). Para que se comuniquen, el servidor web se conecta a **ambas redes**.

```bash
# 1. Crear dos redes separadas
docker network create red_bd
docker network create red_web

# 2. Contenedor de BD → solo en red_bd
docker run -d \
  --name contenedor_bd \
  --network red_bd \
  -e POSTGRES_PASSWORD=admin123 \
  postgres:15

# 3. Contenedor web → primero en red_web
docker run -d \
  --name contenedor_web \
  --network red_web \
  -p 8080:80 \
  mi_imagen_web

# 4. Conectar el contenedor web también a red_bd
#    (así puede hablar con la BD aunque estén en redes distintas)
docker network connect red_bd contenedor_web

# 5. Verificar redes de cada contenedor
docker inspect contenedor_web
docker inspect contenedor_bd
```

> **¿Por qué hacerlo así?**  
> El servidor de BD queda **aislado** de la red pública (`red_web`). Solo el servidor web puede acceder a él. Esto mejora la seguridad del sistema.

---

## Docker Compose

El archivo `docker-compose.yml` define toda la arquitectura del proyecto en un solo lugar.

### docker-compose.yml (configuración completa del proyecto)

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    container_name: db_sysstore
    environment:
      POSTGRES_DB: sysstore
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    volumes:
      - pgdata_sysstore:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - red_bd
    ports:
      - "5432:5432"

  web:
    build: .
    container_name: web_sysstore
    volumes:
      - ./src:/var/www/html
    ports:
      - "8080:80"
    depends_on:
      - db
    networks:
      - red_web
      - red_bd   # el servidor web también se conecta a red_bd para hablar con la BD

volumes:
  pgdata_sysstore:

networks:
  red_bd:
    driver: bridge
  red_web:
    driver: bridge
```

### Levantar con Docker Compose

```bash
# Construir imágenes y levantar todos los contenedores
docker compose up -d --build

# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f web

# Detener todos los contenedores
docker compose down

# Detener y eliminar volúmenes (¡cuidado! borra datos)
docker compose down -v

# Ver estado de los servicios
docker compose ps
```

---

### 2 Contenedores en la Misma Red (Compose)

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    container_name: contenedor_bd
    environment:
      POSTGRES_PASSWORD: admin123
    networks:
      - red_compartida

  web:
    image: nginx
    container_name: contenedor_web
    ports:
      - "8080:80"
    networks:
      - red_compartida     # <-- misma red que BD

networks:
  red_compartida:
    driver: bridge
```

---

### Contenedores en Redes Diferentes (Compose)

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    container_name: contenedor_bd
    environment:
      POSTGRES_PASSWORD: admin123
    networks:
      - red_bd              # BD solo en su red privada

  web:
    image: nginx
    container_name: contenedor_web
    ports:
      - "8080:80"
    networks:
      - red_web             # red pública
      - red_bd              # también en red privada para llegar a la BD

networks:
  red_bd:
    driver: bridge          # red privada, solo BD y web
  red_web:
    driver: bridge          # red "pública"
```

> **Diferencia clave:** `contenedor_bd` **solo** está en `red_bd` (aislada). `contenedor_web` está en **ambas redes**, así puede recibir peticiones externas por `red_web` y al mismo tiempo hablar con la BD por `red_bd`.

---

## CRUD — Operaciones de la Aplicación

El sistema implementa CRUD completo para tres entidades principales:

---

## Base de Datos

### Tablas principales (`init.sql`)

```sql
-- Tabla de Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    categoria VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Tabla de Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150),
    correo VARCHAR(200) UNIQUE,
    telefono VARCHAR(20),
    fecha_alta TIMESTAMP DEFAULT NOW()
);

-- Tabla de Ventas (relaciona Cliente con Producto)
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES clientes(id),
    id_producto INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    total NUMERIC(10,2),
    fecha_venta TIMESTAMP DEFAULT NOW()
);
```

---

## Pasos para Levantar el Proyecto Completo

### Opción A — Docker Compose (Recomendado)

```bash
# 1. Clonar o tener el proyecto en tu máquina
cd C:\Users\mateo\Documents\8VO SEMESTRE\tc\imagenes\paginaweb

# 2. Construir y levantar todo
docker compose up -d --build

# 3. Verificar que los contenedores están corriendo
docker compose ps

# 4. Abrir en el navegador
# http://localhost:8080
```

### Opción B — Comandos Manuales

```bash
# 1. Crear red y volumen
docker network create red_bd
docker network create red_web
docker volume create pgdata_sysstore

# 2. Levantar BD
docker run -d --name db_sysstore --network red_bd \
  -e POSTGRES_DB=sysstore -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 \
  -v pgdata_sysstore:/var/lib/postgresql/data postgres:15

# 3. Construir imagen web
docker build -t sysstore_web .

# 4. Levantar servidor web
docker run -d --name web_sysstore --network red_web \
  -v ./src:/var/www/html -p 8080:80 sysstore_web

# 5. Conectar web a la red de BD
docker network connect red_bd web_sysstore

# 6. Abrir http://localhost:8080
```

---

## 👤 Integrantes del Equipo
** Uri Martinez Flores **
** Mateo Jimenez Perez **
** Aalan Kalid Ruíz Colín **


---
