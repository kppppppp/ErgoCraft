import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name is required').max(150),
    slug: z.string().optional(),
    sku: z.string().min(2, 'SKU is required').max(50),
    category: z.string().min(1, 'Category is required'),
    subcategory: z.string().optional().nullable(),
    classification: z.string().optional().nullable(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    shortDescription: z.string().optional(),
    specifications: z
      .array(
        z.object({
          key: z.string().min(1),
          value: z.string().min(1),
        })
      )
      .optional(),
    attributes: z
      .object({
        material: z.string().optional(),
        backrestHeight: z.string().optional(),
        colour: z.string().optional(),
        armrests: z.string().optional(),
        mechanism: z.string().optional(),
        weightCapacity: z.string().optional(),
        upholstery: z.string().optional(),
        dimensions: z.string().optional(),
      })
      .optional(),
    mrp: z.number().min(0, 'MRP must be positive'),
    sellingPrice: z.number().min(0, 'Selling price must be positive'),
    images: z
      .array(
        z.object({
          url: z.string().min(1, 'Image URL is required').refine((value) => {
            try {
              const parsed = new URL(value);
              return parsed.protocol === 'http:' || parsed.protocol === 'https:';
            } catch {
              return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\');
            }
          }, 'Image must be an HTTP(S) URL or a same-origin path'),
          publicId: z.string().optional(),
          altText: z.string().optional(),
          isPrimary: z.boolean().optional(),
          sortOrder: z.number().optional(),
        })
      )
      .optional(),
    stock: z.number().min(0).optional(),
    isBestseller: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    warranty: z.string().optional(),
    shippingDetails: z
      .object({
        estimatedDays: z.number().optional(),
        freeShipping: z.boolean().optional(),
        shippingCharge: z.number().optional(),
      })
      .optional(),
  }),
});
