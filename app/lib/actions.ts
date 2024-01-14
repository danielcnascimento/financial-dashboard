'use server';

import { sql } from '@vercel/postgres';
import { z as zodForm } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSigning':
          return 'Invalid Credential';

        default:
          return 'Something went wrong :(';
      }
    }

    throw {};
  }
}

// Zod will work aside with useFormHook from react
const FormSchema = zodForm.object({
  id: zodForm.string(),
  customerId: zodForm.string({
    invalid_type_error: 'Please select a costumer.',
  }),
  amount: zodForm.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: zodForm.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: zodForm.date(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// this type actually shouldn't be here, but it's must to make the useFormState hook works without TS errors.
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
/**
 * Creates invoice, refreshes and redirect
 * @param formData {FormData} HTML form data with generic type
 */
export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  console.log({ validatedFields });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const amountInCents = validatedFields.data.amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${validatedFields.data.customerId}, ${amountInCents}, ${status}, ${date})
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
