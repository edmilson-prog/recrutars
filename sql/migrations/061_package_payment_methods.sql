-- Migration 061: Add payment_methods column to test_packages
-- Allows configuring accepted payment methods (card, pix, boleto) per package

ALTER TABLE public.test_packages
ADD COLUMN payment_methods TEXT[] NOT NULL DEFAULT '{card}'::TEXT[];

COMMENT ON COLUMN public.test_packages.payment_methods IS 'Stripe payment methods: card, pix, boleto';
