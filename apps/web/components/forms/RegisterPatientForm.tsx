'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { z } from 'zod';

const CreatePatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

export function RegisterPatientForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const [error, setError] = useState('');
  
  const createPatient = trpc.patients.create.useMutation({
    onSuccess: () => {
      onSuccess();
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Convert empty string email to undefined to pass validation if not provided
    if (data.email === '') delete data.email;

    try {
      const parsed = CreatePatientSchema.parse(data);
      createPatient.mutate({
        ...parsed,
        allergies: [], // simplified for now
      });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div 
      className="p-6 rounded-3xl"
      style={{
        background: '#EEF0F5',
        boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
      }}
    >
      <h3 className="text-xl font-bold text-[#1E2035] mb-6">Register New Patient</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">First Name</label>
            <input name="firstName" required className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">Last Name</label>
            <input name="lastName" required className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">Date of Birth</label>
            <input name="dob" type="date" required className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">Gender</label>
            <select name="gender" required className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">Phone (Optional)</label>
            <input name="phone" className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">Email (Optional)</label>
            <input name="email" type="email" className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#C8CAD4]/30">
          <button type="button" onClick={onCancel} className="px-5 py-2 rounded-xl text-[#5A5A7A] font-semibold hover:bg-[#C8CAD4]/20 transition-all">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={createPatient.isPending}
            className="px-6 py-2 rounded-xl text-white font-semibold bg-[#27AE60] transition-all disabled:opacity-50"
            style={{ boxShadow: '0 4px 14px rgba(39,174,96,0.35)' }}
          >
            {createPatient.isPending ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
}
