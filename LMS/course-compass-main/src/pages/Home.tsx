import { Link } from "react-router-dom";
import { Sparkles, Users, ShieldCheck, BookOpen, BarChart3, ChevronRight, Star, Cpu, Rocket, Award } from "lucide-react";
import { AuthHeroBackground } from "@/components/ui/AuthHeroBackground";

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AuthHeroBackground />

      <div className="relative mx-auto max-w-7xl px-4 py-20">
        <div className="mx-auto max-w-5xl text-center mb-14">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/20 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-300">
            <Sparkles className="w-4 h-4" /> UptoSkills Learning Platform
          </div>
          <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground">
            Learn with Your <span className="text-gradient">Favorite Mentors</span>, Build <span className="text-gradient">Real-World Skills</span>, and <span className="text-gradient">Achieve Your Career Goals</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg md:text-xl text-muted-foreground leading-8">
            Discover inspiring learning paths, unlock verified skills, and move confidently from beginner courses to career-ready mastery.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-4 text-sm text-muted-foreground">
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-3 transition-all hover:border-primary/60 hover:bg-muted/70 animate-fade-in">
              <BookOpen className="w-4 h-4 text-cyan-300" />
              Curated courses
            </div>
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-3 transition-all hover:border-violet-300/60 hover:bg-muted/70 animate-pulse">
              <BarChart3 className="w-4 h-4 text-violet-300" />
              Live analytics
            </div>
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-3 transition-all hover:border-amber-500/60 hover:bg-muted/70 animate-fade-in">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Secure login
            </div>
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-3 transition-all hover:border-cyan-300/60 hover:bg-muted/70 animate-bounce">
              <Users className="w-4 h-4 text-cyan-300" />
              Student success
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-5xl">
          <div className="grid gap-8 items-start text-center">
            <div className="mx-auto">
              <div className="inline-flex items-center gap-2 border border-border bg-background/50 px-5 py-3 text-xs uppercase tracking-[0.24em] text-cyan-300">
                <Sparkles className="w-4 h-4" /> ONE PATH, TWO ROLES
              </div>
            </div>

            <div className="mx-auto grid gap-6 sm:grid-cols-2 max-w-6xl">
              <div className="rounded-[2rem] border border-border bg-background/80 p-8 min-h-[240px]">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <p className="font-semibold text-foreground text-lg">Learner-first onboarding</p>
                <p className="text-sm text-muted-foreground mt-3 leading-7">Start as a student with the right experience from the first click.</p>
              </div>
              <div className="rounded-[2rem] border border-border bg-background/80 p-8 min-h-[240px]">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-500/10 text-violet-300 mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="font-semibold text-foreground text-lg">Admin-ready access</p>
                <p className="text-sm text-muted-foreground mt-3 leading-7">Admins can sign in with a dedicated portal path and secure controls.</p>
              </div>
              <div className="rounded-[2rem] border border-border bg-background/80 p-8 min-h-[240px]">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 mb-5">
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="font-semibold text-foreground text-lg">Course-driven learning</p>
                <p className="text-sm text-muted-foreground mt-3 leading-7">Match courses to your goals with clear, guided learning tracks.</p>
              </div>
              <div className="rounded-[2rem] border border-border bg-background/80 p-8 min-h-[240px]">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-5">
                  <Rocket className="w-6 h-6" />
                </div>
                <p className="font-semibold text-foreground text-lg">Fast access</p>
                <p className="text-sm text-muted-foreground mt-3 leading-7">Arrive at login/register with the correct role already selected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

