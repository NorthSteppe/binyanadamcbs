import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Award, Linkedin, Globe, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const TeamMemberProfile = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: member, isLoading } = useQuery({
    queryKey: ["team-member", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!member) return <NotFound />;

  const credentials = member.credentials
    ? member.credentials.split("\n").filter((c: string) => c.trim())
    : [];

  const heroImage = member.profile_image_url || member.avatar_url;
  const longBio = member.long_bio || member.bio;
  const paragraphs = longBio.split("\n\n").filter((p: string) => p.trim());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Back to About
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={`${member.name} — ${member.role}`}
                    className="w-full h-auto object-cover aspect-[3/4]"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-primary/10 flex items-center justify-center text-6xl font-serif text-primary">
                    {member.initials}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
                {member.role}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6">
                {member.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                {member.bio}
              </p>

              {credentials.length > 0 && (
                <div className="space-y-4 mb-10">
                  {credentials.map((cred: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <Award size={20} className="text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-semibold text-foreground">{cred}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Social links */}
              <div className="flex items-center gap-4">
                {member.social_linkedin && (
                  <a href={member.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin size={20} />
                  </a>
                )}
                {member.social_twitter && (
                  <a href={member.social_twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter size={20} />
                  </a>
                )}
                {member.social_website && (
                  <a href={member.social_website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Globe size={20} />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Extended Bio */}
      {paragraphs.length > 0 && member.long_bio && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={0}
              >
                <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
                  About {member.name.split(" ")[0]}
                </h2>
                <div className="space-y-5 text-muted-foreground leading-relaxed">
                  {paragraphs.map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Reach out to learn more about how {member.name.split(" ")[0]} can support you.
            </p>
            <Button size="lg" asChild className="rounded-full px-8">
              <Link to="/contact" className="inline-flex items-center gap-2">
                Book a Consultation <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TeamMemberProfile;
