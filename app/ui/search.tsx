'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  // useSearchParams will give me the parameters of my current URL, note that in `handleChange` I **set** the value 'query' and the result of it
  // is, e.g. "pathname"?query=banana
  const searchParams = useSearchParams();
  // pathname hook returns the current pathname.
  const pathname = usePathname();
  // replace is a method from useRoute hook to manipulate the URL in every time the function is called.
  const { replace } = useRouter();

  // Here i'm saying the this component will change it's page URL, and if you have a look on /dashboard/invoices/page,
  // you will see that you can recover this values from the "props" by using "searchParams".
  const handleChange = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    replace(`${pathname}?${params.toString()}`);
  }, 500);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        onChange={(event) => {
          handleChange(event.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
