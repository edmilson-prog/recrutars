/**
 * ContactInfo Component
 * PRD-028: Central de Ajuda - Contact Information Display
 */

import { motion } from 'framer-motion';
import { Mail, Phone, Clock } from 'lucide-react';

export function ContactInfo() {
  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: 'suporte@recrutars.com.br',
      description: 'Resposta em até 24h',
      href: 'mailto:suporte@recrutars.com.br',
    },
    {
      icon: Phone,
      label: 'Telefone',
      value: '(55) 99999-9999',
      description: 'Seg-Sex 9h às 18h',
      href: 'tel:+5555999999999',
    },
    {
      icon: Clock,
      label: 'Horário de Atendimento',
      value: 'Segunda a Sexta',
      description: '9h às 18h',
      href: null,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {contactMethods.map((method, index) => {
        const Icon = method.icon;
        const CardContent = (
          <>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
              <Icon className="h-6 w-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{method.label}</h3>
              <p className="mt-1 text-sm font-medium text-foreground/90">
                {method.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {method.description}
              </p>
            </div>
          </>
        );

        return (
          <motion.div
            key={method.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {method.href ? (
              <a
                href={method.href}
                className="block bg-card rounded-2xl shadow-soft p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                    <Icon className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{method.label}</h3>
                    <p className="mt-1 text-sm font-medium text-secondary group-hover:underline">
                      {method.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
              </a>
            ) : (
              <div className="bg-card rounded-2xl shadow-soft p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{method.label}</h3>
                    <p className="mt-1 text-sm font-medium text-foreground/90">
                      {method.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
