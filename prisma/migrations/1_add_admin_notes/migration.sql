-- Agrega notas privadas de admin por inscripción
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;
