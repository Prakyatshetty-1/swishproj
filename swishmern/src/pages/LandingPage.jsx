import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowRight, Users, Shield, Zap, Heart, Sparkles } from "lucide-react";


import SplitText from "../components/ui/SplitText";
import Iridescence from "../components/ui/Iridescence";

export default function Landing() {
    return (
        <div className="relative min-h-screen flex flex-col bg-background">

            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
                <Iridescence
                    color={[0.3, 0.5, 1.0]}
                    mouseReact={true}
                    amplitude={0.1}
                    speed={1.0}
                />
            </div>

            {/* Navbar - Pinned to the Screen's Top Left Edge */}
            <nav className="fixed top-0 left-5 z-50 p-6">
                <div className="flex items-center gap-2 select-none cursor-pointer">
                    <div className="bg-primary text-white w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center shadow-glow">
                        <Sparkles className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-2xl font-bold text-gradient">Swish</span>
                </div>
            </nav>
            <br />
            {/* Hero Section */}
            {/* Added relative and overflow-hidden to contain the background animation */}
            <section className="relative z-10 overflow-visible flex-1 flex items-center justify-center px-4 py-12 lg:py-0">
                {/* Added z-10 and relative to ensure content sits ON TOP of the animation */}
                <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Content */}
                    <div className="text-center lg:text-left animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Now Available for Students & Faculty</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                            {/* 3. The SplitText Animation */}
                            <SplitText
                                text="The Exclusive Social Network for"
                                className="inline-block"
                                delay={50}
                                animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                                animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                                threshold={0.2}
                                rootMargin="-50px"
                            />
                            {/* Keeping the gradient span separate so it pops */}
                            <span className="text-gradient block mt-2">Your Campus</span>
                        </h1>

                        <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                            Connect with students and faculty. Share your campus life.
                            Build meaningful relationships within your university community.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button variant="brand" size="xl" asChild>
                                <Link to="/signup">
                                    Join Community
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                            <Button variant="hero" size="xl" asChild>
                                <Link to="/login">
                                    Login
                                </Link>
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-center lg:justify-start gap-8 mt-10 pt-10 border-t border-border">
                            <div className="text-center lg:text-left">
                                <p className="text-2xl lg:text-3xl font-bold text-foreground">2.8K+</p>
                                <p className="text-sm text-muted-foreground">Active Users</p>
                            </div>
                            <div className="text-center lg:text-left">
                                <p className="text-2xl lg:text-3xl font-bold text-foreground">12K+</p>
                                <p className="text-sm text-muted-foreground">Daily Posts</p>
                            </div>
                            <div className="text-center lg:text-left">
                                <p className="text-2xl lg:text-3xl font-bold text-foreground">98%</p>
                                <p className="text-sm text-muted-foreground">Verified Campus</p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Phone Mockup */}
                    <div className="relative flex justify-center lg:justify-end animate-float">
                        <div className="relative">
                            {/* Phone Frame */}
                            <div className="w-72 sm:w-80 bg-foreground rounded-[3rem] p-3 shadow-2xl">
                                <div className="bg-card rounded-[2.5rem] overflow-hidden">
                                    {/* Phone Notch */}
                                    <div className="h-8 bg-foreground flex items-center justify-center">
                                        <div className="w-20 h-6 bg-foreground rounded-full" />
                                    </div>

                                    {/* App Content Preview */}
                                    <div className="p-4 space-y-4 h-[500px] overflow-hidden">
                                        {/* Stories */}
                                        <div className="flex gap-3">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="w-14 h-14 rounded-full gradient-brand p-0.5 flex-shrink-0">
                                                    <div className="w-full h-full rounded-full bg-muted" />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Mock Post */}
                                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                            <div className="flex items-center gap-2 p-3">
                                                <div className="w-8 h-8 rounded-full bg-muted" />
                                                <div className="flex-1">
                                                    <div className="h-3 w-20 bg-muted rounded" />
                                                    <div className="h-2 w-14 bg-muted rounded mt-1" />
                                                </div>
                                            </div>
                                            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                <Heart className="w-16 h-16 text-primary/30" />
                                            </div>
                                            <div className="p-3 space-y-2">
                                                <div className="h-3 w-24 bg-muted rounded" />
                                                <div className="h-2 w-full bg-muted rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-6 -right-6 w-20 h-20 bg-card rounded-2xl shadow-lg flex items-center justify-center animate-pulse-slow">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-card rounded-2xl shadow-lg flex items-center justify-center animate-pulse-slow" style={{ animationDelay: "1s" }}>
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <br />
            {/* Features Section */}
            <section className="relative z-10 py-16 px-4 bg-card/50 border-t border-border">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
                        Why Choose <span className="text-gradient">Swish</span>?
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-2">Campus Verified</h3>
                            <p className="text-sm text-muted-foreground">Only verified students and faculty can join your campus network.</p>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-2">Real Connections</h3>
                            <p className="text-sm text-muted-foreground">Connect with classmates, professors, and campus organizations.</p>
                        </div>
                        <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-2">Stay Updated</h3>
                            <p className="text-sm text-muted-foreground">Never miss campus events, announcements, or trending topics.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}