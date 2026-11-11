
import bcrypt from 'bcryptjs';
import { Admin } from '../models/index.js';

export async function initAdmin() {
  const password = process.env.ADMIN_PASSWORD;

  const count = await Admin.countDocuments();

  if (count > 0) {
    console.log('Admin already exists. Skipping setup.');
    return;
  }

  if (!password || password.length < 12) {
    console.log('Admin setup skipped: ADMIN_PASSWORD must be at least 12 characters.');
    return;
  }

  await Admin.create({
    name: 'LifeFlow Administrator',
    email: 'admin@lifeflow.com',
    password: await bcrypt.hash(password, 12),
    active: true
  });

  console.log('Default LifeFlow Admin created successfully.');
}
