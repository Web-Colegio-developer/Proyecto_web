import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

// ==========================
//  MYSQL POOL
// ==========================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ==========================
//  CLOUDINARY CONFIG
// ==========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Exportamos ambos correctamente:
export { pool, cloudinary };
