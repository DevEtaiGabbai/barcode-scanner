"use client";
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { LoadingButton } from './ui/LoadingButton'; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ResponseType {
  product_name?: string;
  code?: string;
  categories?: string;
  countries?: string;
  ingredients_text?: string;
  allergens?: string;
  nutrition_grades?: string;
  image_url?: string;
  image_ingredients_url?: string;
  image_front_url?: string;
}

export default function Reader() {
  const [response, setResponse] = useState<ResponseType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultsOpen, setResultsOpen] = useState<boolean>(false)

  const onSubmit = () => {
    const input = document.getElementById('imageInput') as HTMLInputElement;
    if (input?.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = function (event) {
        const target = event.target as FileReader | null;
        if (target && typeof target.result === 'string') {
          const base64Image = target.result.split(',')[1];
          setLoading(true);
          fetch('http://127.0.0.1:5000/scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64Image }),
          })
            .then((response) => response.json())
            .then((data) => {
              setResponse(data.product);
              setResultsOpen(true)
              setLoading(false);
            })
            .catch((error) => {
              console.error('Error:', error);
              setLoading(false);
            });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl md:text-5xl font-bold leading-tight md:leading-[1.1] text-center px-10 pt-2">Barcode Scanner</h1>
      <p className="text-xl text-gray-400 pb-10">Upload an Image below ⬇️</p>
      <div className="flex flex-col items-center">
        <Input type="file" id="imageInput" accept="image/*" className="w-full mb-2" />
        <LoadingButton loading={loading} className="w-full" onClick={onSubmit}>Upload</LoadingButton>
      </div>
      {response && (
        <div className="mt-4 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
          <Dialog open={resultsOpen}>
            <DialogContent>
                <DialogClose>
                    <X onClick={() => setResultsOpen(false)} className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground' />
                </DialogClose>
              <DialogHeader>
                <DialogTitle className='text-2xl'>{response.product_name}</DialogTitle>
                <DialogDescription className='text-indigo-500'>
                  <a href={`https://www.barcodelookup.com/${response.code}`} target='_blank'>
                  #{response.code}
                  </a>
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-1 border-t'>
              <p className="mt-2 text-gray-500">Categories: {response.categories}.</p>
                  <p className="mt-2 text-gray-500">Country: {response.countries}</p>
                  <p className="mt-2 text-gray-500">Ingredients: {response.ingredients_text}.</p>
                  <p className="mt-2 text-gray-500">Allergens: {response.allergens ? response.allergens : 'None specified'}.</p>
                  <p className="mt-2 text-gray-500">Nutrition Grades: {response.nutrition_grades?.toUpperCase()}. </p>
                  <p className='border-b text-md font-semibold leading-none tracking-tight pt-1 pb-1'>Product images</p>
                  <div className='pt-2 flex left-0 space-x-2'>
                    <img src={response.image_ingredients_url} alt="Ingredients" className="w-20 h-20 object-cover rounded-xl" />
                    <img src={response.image_url} alt="Main" className="w-20 h-20 object-cover rounded-xl" />
                    <img src={response.image_front_url} alt="Front" className="w-20 h-20 object-cover rounded-xl" />
                  </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}