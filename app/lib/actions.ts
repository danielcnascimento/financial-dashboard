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
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

/**
 * Creates invoice, refreshes and redirect
 * @param formData {FormData} HTML form data with generic type
 */
export async function createInvoice(formData: FormData) {
  const { amount, status, customerId } = CreateInvoice.parse(
    Object.fromEntries(formData.entries()),
  );

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch {
    console.log('Error');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/**
 * Updates a invoice, based on `id`, refreshes and redirect the user.
 * @param id invoice id for reference
 * @param formData HTML form data, with generic type
 */
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch {
    console.log('Error');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/**
 * Handles the `delete` cycle, and it's error flow.
 * @param id the reference id.
 * @returns Object with an error message.
 */
export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
