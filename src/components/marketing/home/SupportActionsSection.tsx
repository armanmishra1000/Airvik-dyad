import Link from "next/link";
import { type Variants, motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

type SupportAction = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  eyebrow?: string;
  icon: LucideIcon;
};

type SupportActionsSectionProps = {
  actions: SupportAction[];
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function SupportActionsSection({ actions }: SupportActionsSectionProps) {
  return (
    <section className="bg-background py-10 sm:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto max-w-3xl space-y-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headingVariants}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Support the Ashram
          </p>
          <h2 className="2xl:text-5xl md:text-4xl text-3xl font-bold text-foreground">
            Share your experience or support our seva
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Choose the path that resonates with you today share your heartfelt
            feedback or contribute toward the Ashram’s daily seva.
          </p>
        </motion.div>
        <motion.div
          className="mt-12 grid gap-6 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardsContainerVariants}
        >
          {actions.map((action) => (
            <motion.article
              key={action.title}
              style={{ backgroundColor: "rgba(255, 248, 243, 0.85)" }}
              className="rounded-3xl border border-border/20 p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-md"
              variants={cardVariants}
            >
              <div className="flex items-center gap-3 text-primary">
                <action.icon className="size-5" aria-hidden />
                {action.eyebrow ? (
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                    {action.eyebrow}
                  </p>
                ) : null}
              </div>
              <h3 className="mt-4 text-2xl font-serif font-semibold text-foreground">
                {action.title}
              </h3>
              <p className="mt-3 text-base text-muted-foreground">
                {action.description}
              </p>
              <Link
                href={action.href}
                aria-label={`${action.ctaLabel} - ${action.title}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {action.ctaLabel}
                <span aria-hidden>→</span>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export type { SupportAction };
