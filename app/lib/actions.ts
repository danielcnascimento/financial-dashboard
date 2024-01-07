'use server';

import { sql } from '@vercel/postgres';
import { z as zodForm } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = zodForm.object({
  id: zodForm.string(),
  customerId: zodForm.string(),
  amount: zodForm.coerce.number(),
  status: zodForm.enum(['pending', 'paid']),
  date: zodForm.date(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { amount, status, customerId } = CreateInvoice.parse(
    Object.fromEntries(formData.entries()),
  );

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
