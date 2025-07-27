"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { getAnalysis, getSituationAnalysis, getPPDTAnalysis, type AnalysisResults, type SituationAnalysisResult, type PPDTAnalysisResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, BrainCircuit, Smile, Meh, Frown, UserCircle2, Sparkles, AlertTriangle, ArrowRight, BookOpen, MessageSquare, ListChecks, ArrowDownCircle, Star, FileText, Quote, HeartPulse, ClipboardCheck, ChevronsUp, UserCheck, Clock, Camera, Users, PenSquare, Eye, ShieldCheck, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";


const SentimentDisplay = ({ sentiment }: { sentiment: string }) => {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return <div className="flex items-center gap-2"><Smile className="h-5 w-5 text-green-500" /> <span className="font-semibold text-lg">{sentiment}</span></div>;
    case 'negative':
      return <div className="flex items-center gap-2"><Frown className="h-5 w-5 text-red-500" /> <span className="font-semibold text-lg">{sentiment}</span></div>;
    default:
      return <div className="flex items-center gap-2"><Meh className="h-5 w-5 text-yellow-500" /> <span className="font-semibold text-lg">{sentiment}</span></div>;
  }
};

const wordAssociationSchema = z.object({
  sentences: z.array(
    z.object({
      word: z.string(),
      value: z.string(),
    })
  ).length(5),
});

const situationReactionSchema = z.object({
  reactions: z.array(
    z.object({
      situation: z.string(),
      value: z.string(),
    })
  ).length(5),
});

const ppdtSchema = z.object({
  characterCount: z.number().min(1, "Please specify the number of characters."),
  characters: z.array(z.object({
    gender: z.string().min(1, "Gender is required."),
    mood: z.string().min(1, "Mood is required."),
  })),
  story: z.string().min(1, "Please write a story."),
});


const predefinedWords = ["friend", "fear", "courage", "class", "games"];
const predefinedSituations = [
  "You see someone drop their wallet on a busy street.",
  "Your boss gives you negative feedback on a project you worked hard on.",
  "You are stuck in a traffic jam and are running late for an important meeting.",
  "A friend tells you a secret and asks you not to tell anyone.",
  "You witness a minor car accident where no one appears to be hurt."
];
const PPDT_IMAGE_PATH = "/images/ppdt-image.jpg";

type AppMode = 'welcome' | 'word-association' | 'situation-reaction' | 'ppdt';
type TestState = 'instructions' | 'active' | 'results';
type PPDTStep = 'perception' | 'details' | 'story';

export default function Home() {
  const [mode, setMode] = useState<AppMode>('welcome');
  const [testState, setTestState] = useState<TestState>('instructions');
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [situationResults, setSituationResults] = useState<SituationAnalysisResult | null>(null);
  const [ppdtResults, setPPDTResults] = useState<PPDTAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // PPDT specific state
  const [ppdtStep, setPPDTStep] = useState<PPDTStep>('perception');
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);

  const wordAssociationForm = useForm<z.infer<typeof wordAssociationSchema>>({
    resolver: zodResolver(wordAssociationSchema),
    defaultValues: {
      sentences: predefinedWords.map(word => ({ word, value: "" })),
    },
    mode: "onChange"
  });

  const situationReactionForm = useForm<z.infer<typeof situationReactionSchema>>({
    resolver: zodResolver(situationReactionSchema),
    defaultValues: {
      reactions: predefinedSituations.map(situation => ({ situation, value: "" })),
    },
    mode: "onChange"
  });
  
  const ppdtForm = useForm<z.infer<typeof ppdtSchema>>({
    resolver: zodResolver(ppdtSchema),
    defaultValues: {
      characterCount: 1,
      characters: [{gender: '', mood: ''}],
      story: '',
    },
  });

  const { fields: characterFields, append: appendCharacter, remove: removeCharacter } = useFieldArray({
    control: ppdtForm.control,
    name: "characters"
  });

  const characterCount = ppdtForm.watch("characterCount");
  
  useEffect(() => {
    const currentCount = characterFields.length;
    if (characterCount > currentCount) {
        for (let i = 0; i < characterCount - currentCount; i++) {
            appendCharacter({ gender: '', mood: '' });
        }
    } else if (characterCount < currentCount) {
        for (let i = 0; i < currentCount - characterCount; i++) {
            removeCharacter(currentCount - 1 - i);
        }
    }
  }, [characterCount, appendCharacter, removeCharacter, characterFields.length]);


  let currentForm: any;
  if (mode === 'word-association') {
    currentForm = wordAssociationForm;
  } else if (mode === 'situation-reaction') {
    currentForm = situationReactionForm;
  } else {
    currentForm = ppdtForm;
  }
  
  const { control, handleSubmit, trigger, getValues } = currentForm;

  const { fields: wordFields } = useFieldArray({
    control: wordAssociationForm.control,
    name: "sentences",
  });

  const { fields: situationFields } = useFieldArray({
    control: situationReactionForm.control,
    name: "reactions",
  });

  const TIME_LIMITS: Record<AppMode, number> = {
    'word-association': 22,
    'situation-reaction': 30,
    'ppdt': 0, // PPDT has multi-step timer
    'welcome': 0,
  };
  
  const startTimer = (duration: number, onComplete?: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          if (onComplete) onComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  useEffect(() => {
    if (testState !== 'active') return;

    if (mode === 'ppdt' && !ppdtResults) {
      if (ppdtStep === 'perception') {
        startTimer(30, () => setPPDTStep('details'));
      } else if (ppdtStep === 'details') {
        startTimer(30, () => setPPDTStep('story'));
      } else if (ppdtStep === 'story') {
        startTimer(240, () => handleSubmit(onPPDTSubmit)());
      }
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, ppdtStep, ppdtResults, testState]);

  useEffect(() => {
    if (testState !== 'active') return;

    if ((mode === 'word-association' || mode === 'situation-reaction') && !results && !situationResults) {
      if(activeStep < (mode === 'word-association' ? predefinedWords.length : predefinedSituations.length)) {
         startTimer(TIME_LIMITS[mode], handleNextStep);
      }
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, activeStep, results, situationResults, testState]);
  
  const handleNextStep = async () => {
      const itemsLength = mode === 'word-association' ? predefinedWords.length : predefinedSituations.length;
      if (activeStep < itemsLength - 1) {
          setActiveStep(prev => prev + 1);
      } else {
          await handleSubmit(mode === 'word-association' ? onWordAssociationSubmit : onSituationReactionSubmit)();
      }
  };

  const onWordAssociationSubmit = async (data: z.infer<typeof wordAssociationSchema>) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    if (timerRef.current) clearInterval(timerRef.current);

    const result = await getAnalysis(data.sentences);
    if ("error" in result) {
      setError(result.error);
    } else {
      setResults(result);
      setTestState('results');
    }

    setIsLoading(false);
  };

  const onSituationReactionSubmit = async (data: z.infer<typeof situationReactionSchema>) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const reactions = data.reactions.map(r => ({ situation: r.situation, reaction: r.value }));
    const result = await getSituationAnalysis(reactions);
    
    if ("error" in result) {
        setError(result.error);
    } else {
        setSituationResults(result);
        setTestState('results');
    }

    setIsLoading(false);
  };
  
  const onPPDTSubmit = async (data: z.infer<typeof ppdtSchema>) => {
    if (isLoading || !imageDataUri) return;
    setIsLoading(true);
    setError(null);
    if (timerRef.current) clearInterval(timerRef.current);

    const result = await getPPDTAnalysis(imageDataUri, data.story, data.characters);

    if ("error" in result) {
      setError(result.error);
    } else {
      setPPDTResults(result);
      setTestState('results');
    }
    setIsLoading(false);
  };

  const handleManualNext = async () => {
    const fieldName = mode === 'word-association' ? `sentences.${activeStep}.value` : `reactions.${activeStep}.value`;
    const isValid = await trigger(fieldName as any);
    if (isValid) {
      handleNextStep();
    }
  };

  const startOver = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    wordAssociationForm.reset({ sentences: predefinedWords.map(word => ({ word, value: "" })) });
    situationReactionForm.reset({ reactions: predefinedSituations.map(situation => ({ situation, value: "" })) });
    ppdtForm.reset({characterCount: 1, characters: [{gender: '', mood: ''}], story: ''});
    setResults(null);
    setSituationResults(null);
    setPPDTResults(null);
    setError(null);
    setActiveStep(0);
    setPPDTStep('perception');
    setImageDataUri(null);
    setMode('welcome');
    setTestState('instructions');
  };

  const startTest = (selectedMode: AppMode) => {
      setMode(selectedMode);
      setTestState('active');
  }

  const selectTest = (selectedMode: AppMode) => {
    setMode(selectedMode);
    setActiveStep(0); // Reset for tests that use it
    setTestState('instructions');
  }
  
  const getFields = () => mode === 'word-association' ? wordFields : situationFields;
  const getItems = () => mode === 'word-association' ? predefinedWords : predefinedSituations;
  const getFormName = () => mode === 'word-association' ? 'sentences' : 'reactions';

  const testOptions = [
    { 
      mode: 'word-association' as AppMode, 
      icon: BookOpen, 
      title: 'Word Association Test', 
      description: 'Analyze your subconscious thoughts and emotional responses through word association.',
    },
    { 
      mode: 'situation-reaction' as AppMode, 
      icon: MessageSquare, 
      title: 'Situation Reaction Test', 
      description: 'Evaluate your decision-making and problem-solving skills under pressure.',
    },
    { 
      mode: 'ppdt' as AppMode, 
      icon: Camera, 
      title: 'Picture Perception Test', 
      description: 'Assess your perception, imagination, and storytelling abilities with a visual prompt.',
    }
  ];

  const renderWelcomeScreen = () => (
    <div className="w-full animate-in fade-in-50 duration-500">
      <section className="text-center py-16 md:py-24 relative overflow-hidden rounded-lg bg-gradient-to-b from-primary/10 to-background">
         <div
          aria-hidden="true"
          className="absolute inset-0 z-0 grid grid-cols-2 -space-x-52 opacity-40 transition-opacity duration-500 group-hover:opacity-50"
        >
          <div className="h-56 bg-gradient-to-br from-primary to-purple-500/50 blur-[106px]"/>
          <div className="h-32 bg-gradient-to-r from-cyan-400 to-sky-300 blur-[106px]"/>
        </div>

        <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
              Unlock Your Potential
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Engage in our specialized psychometric tests designed to reveal your strengths, evaluate your potential, and foster personal growth.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" onClick={() => document.getElementById('tests')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                Begin Assessment
              </Button>
            </div>
        </div>
      </section>

      <section id="tests" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
              Choose Your Assessment
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testOptions.map((test) => (
                <Card key={test.mode} className="flex flex-col bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                   <CardHeader className="flex-grow">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg group-hover:scale-110 group-hover:bg-primary/20 transition-transform duration-300">
                        <test.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle>{test.title}</CardTitle>
                    </div>
                    <CardDescription className="pt-4">{test.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button className="w-full bg-primary/90 hover:bg-primary text-primary-foreground" onClick={() => selectTest(test.mode)}>
                      Start Test <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
        </div>
      </section>
    </div>
  );

  const renderInstructionScreen = () => {
    const instructions: Record<AppMode, {title: string; icon: React.ElementType, points: string[]}> = {
        'word-association': {
            title: 'Word Association Test (WAT) Instructions',
            icon: BookOpen,
            points: [
                'You will be shown 5 words, one by one.',
                'For each word, you will have 22 seconds to write a sentence.',
                'Your responses are saved automatically when the timer ends or you move to the next word.',
                'Be spontaneous and write whatever comes to your mind first.'
            ]
        },
        'situation-reaction': {
            title: 'Situation Reaction Test Instructions',
            icon: MessageSquare,
            points: [
                'You will be presented with 5 different situations.',
                'For each situation, you have 30 seconds to describe how you would react.',
                'Your responses are saved automatically.',
                'Focus on providing a clear and decisive course of action.'
            ]
        },
        'ppdt': {
            title: 'PPDT Instructions',
            icon: Camera,
            points: [
                'You will be shown an image for 30 seconds. Observe it carefully.',
                'Next, you will have 30 seconds to note down the number of characters, their gender, and their mood.',
                'Finally, you will have 4 minutes to write a story about what led to the situation, what is happening, and what the outcome will be.',
                'Your story should be coherent and based on your perception of the image.'
            ]
        },
        'welcome': {title: '', icon: () => null, points: []}
    };

    if (mode === 'welcome') return null;

    const { title, icon: Icon, points } = instructions[mode];

    return (
        <Card className="shadow-lg animate-in fade-in-50 duration-500 bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <span>{title}</span>
                </CardTitle>
                <CardDescription>Please read the following instructions carefully before you begin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ul className="list-disc pl-5 space-y-2">
                    {points.map((point, index) => (
                        <li key={index}>{point}</li>
                    ))}
                </ul>
                <div className="flex justify-between items-center pt-4">
                   <Button variant="outline" onClick={startOver}>Back to Home</Button>
                   <Button size="lg" onClick={() => startTest(mode)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                        Start Test <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
  }

  const renderLoadingScreen = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h2 className="text-2xl font-semibold text-primary">Generating Your Report</h2>
        <p className="text-lg text-muted-foreground">
            Our AI analyst is analyzing your responses...
        </p>
        <Progress value={50} className="w-full max-w-md animate-pulse" />
        <p className="text-sm text-muted-foreground">This may take a few moments. Thank you for your patience.</p>
    </div>
  );

  const renderTestUI = () => {
    const items = getItems();
    const fields = getFields();
    const formName = getFormName();

    return (
      <>
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
            {mode === 'word-association' ? 'Word Association Test' : 'Situation Reaction Test'}
          </h1>
          <p className="mt-2 text-base sm:text-lg text-muted-foreground">
            {mode === 'word-association' ? 'Describe your feelings about each word to unlock deep insights.' : 'Describe how you would react in each situation.'}
          </p>
        </header>

        <FormProvider {...currentForm}>
          <form>
            <Card className="shadow-lg animate-in fade-in-50 duration-500 bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-left text-2xl flex-1">
                      {mode === 'word-association' ? 'Write a sentence about: ' : ''}
                      <span className="text-primary font-bold">{items[activeStep]}</span>
                    </CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 font-mono text-lg font-semibold text-primary">
                            <Clock className="h-6 w-6" />
                            <span>{timeLeft}s</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={startOver}>
                            <XCircle className="h-6 w-6 text-muted-foreground" />
                            <span className="sr-only">Exit Test</span>
                        </Button>
                    </div>
                  </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} style={{ display: index === activeStep ? 'block' : 'none' }}>
                      <FormField
                        control={control}
                        name={`${formName}.${index}.value` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only">{items[index]}</FormLabel>
                            <FormControl>
                              {mode === 'word-association' ? (
                                  <Input placeholder="Enter your sentence here..." {...field} />
                              ) : (
                                  <Textarea placeholder="Describe your action or reaction here..." {...field} rows={4}/>
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                ))}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">
                    Step {activeStep + 1} of {items.length}
                  </span>
                  {activeStep < items.length - 1 ? (
                    <Button type="button" onClick={handleManualNext}>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => handleSubmit(mode === 'word-association' ? onWordAssociationSubmit : onSituationReactionSubmit)()}>Generate Report</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </FormProvider>
      </>
    );
  };
  
  const renderPPDT_UI = () => {
    return (
      <>
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">Picture Perception & Description Test</h1>
          <p className="mt-2 text-base sm:text-lg text-muted-foreground">
            Observe the image, note the details, and then write a compelling story.
          </p>
        </header>

        <Card className="shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>
                    {ppdtStep === 'perception' && 'Observe the Image'}
                    {ppdtStep === 'details' && 'Describe the Scene'}
                    {ppdtStep === 'story' && 'Write Your Story'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={startOver}>
                    <XCircle className="h-6 w-6 text-muted-foreground" />
                    <span className="sr-only">Exit Test</span>
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {ppdtStep === 'perception' && (
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <CardDescription>You have 30 seconds to perceive the image.</CardDescription>
                <div className="relative w-full max-w-lg aspect-video rounded-md overflow-hidden border">
                    <Image 
                        src={PPDT_IMAGE_PATH} 
                        alt="PPDT stimulus: A person with a rope preparing to rescue another person from the water." 
                        width={600}
                        height={400}
                        data-ai-hint="drowning rescue"
                        className="object-contain"
                        onLoad={(e) => {
                            const img = e.target as HTMLImageElement;
                            const canvas = document.createElement('canvas');
                            // img.crossOrigin = 'Anonymous';
                            canvas.width = img.naturalWidth;
                            canvas.height = img.naturalHeight;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0);
                            try {
                                setImageDataUri(canvas.toDataURL('image/jpeg'));
                            } catch (error) {
                                console.error("Could not get image data URL", error);
                                setError("Could not process the test image. Please try refreshing the page.")
                            }
                        }}
                     />
                </div>
                <div className="flex items-center gap-2 font-mono text-lg font-semibold text-primary pt-4">
                  <Clock className="h-6 w-6" />
                  <span>{timeLeft}s</span>
                </div>
              </div>
            )}
            
            {ppdtStep === 'details' && (
              <FormProvider {...ppdtForm}>
                <form onSubmit={(e) => { e.preventDefault(); setPPDTStep('story'); }}>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <CardDescription>You have 30 seconds to describe the characters and their mood.</CardDescription>
                        <div className="flex items-center gap-2 font-mono text-lg font-semibold text-primary">
                            <Clock className="h-6 w-6" />
                            <span>{timeLeft}s</span>
                        </div>
                      </div>
                        <FormField
                            control={ppdtForm.control}
                            name="characterCount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number of Characters</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select number of characters" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {[1,2,3,4,5].map(i => <SelectItem key={i} value={String(i)}>{i}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="space-y-4">
                            {characterFields.map((field, index) => (
                                <Card key={field.id} className="p-4 bg-background/50">
                                    <h4 className="font-semibold mb-2">Character {index + 1}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={ppdtForm.control}
                                            name={`characters.${index}.gender`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Gender</FormLabel>
                                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={ppdtForm.control}
                                            name={`characters.${index}.mood`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mood</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Mood" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="positive">Positive</SelectItem>
                                                            <SelectItem value="negative">Negative</SelectItem>
                                                            <SelectItem value="neutral">Neutral</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>
                        <Button type="submit" className="w-full">Proceed to Story Writing</Button>
                    </div>
                </form>
              </FormProvider>
            )}

            {ppdtStep === 'story' && (
              <FormProvider {...ppdtForm}>
                 <form onSubmit={ppdtForm.handleSubmit(onPPDTSubmit)} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <CardDescription>Based on the image, write a story about what led to the situation, what is happening, and what the outcome will be.</CardDescription>
                      <div className="flex items-center gap-2 font-mono text-lg font-semibold text-primary">
                          <Clock className="h-6 w-6" />
                          <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                    
                    <FormField
                      control={ppdtForm.control}
                      name="story"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea {...field} rows={15} placeholder="Start your story here..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>Generate Analysis</Button>
                 </form>
              </FormProvider>
            )}
          </CardContent>
        </Card>
      </>
    )
  }
  
  const renderWordAssociationResults = () => (
    results && (
      <section className="space-y-6 animate-in fade-in-50 duration-500">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary">Word Association Test: Evaluation</h2>
          <p className="text-muted-foreground mt-2">Prepared by our AI Analysis Team.</p>
          <Button onClick={startOver} variant="outline" className="mt-4">Start Over</Button>
        </div>
        
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {results.wordAnalyses.map((result, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-left flex-1 capitalize">{result.word}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-2 space-y-4">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Quote className="h-5 w-5 text-primary"/> Your Response
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="italic">"{result.sentence}"</p>
                            <div className="flex gap-4 mt-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Smile className="h-4 w-4"/>
                                    <strong>Sentiment:</strong> {result.report.sentiment}
                                </div>
                                <div className="flex items-center gap-2">
                                    <HeartPulse className="h-4 w-4"/>
                                    <strong>Emotion:</strong> {result.report.emotion}
                                </div>
                            </div>
                        </CardContent>
                     </Card>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <ArrowDownCircle className="h-5 w-5"/> Shortcomings
                            </CardTitle>
                            <CardDescription>Potential areas for development.</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                              {result.report.shortcomings.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </CardContent>
                        </Card>
                        <Card>
                           <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-green-600">
                                <ListChecks className="h-5 w-5"/> Constructive Suggestions
                              </CardTitle>
                              <CardDescription>Recommendations for a stronger response.</CardDescription>
                            </CardHeader>
                          <CardContent>
                             <ul className="list-disc pl-5 space-y-2 text-sm">
                                {result.report.improvements.map((item, i) => <li key={i}>{item}</li>)}
                              </ul>
                          </CardContent>
                        </Card>
                    </div>
                  </AccordionContent>
              </AccordionItem>
          ))}
        </Accordion>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <span>Overall Analysis Report</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-base">
                            <BrainCircuit className="h-5 w-5 text-primary" />
                            <span>Inferred Qualities</span>
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                        {results.qualities.map((quality, index) => (
                            <Badge key={index} variant="secondary" className="text-sm px-3 py-1">{quality}</Badge>
                        ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Sentiment Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <SentimentDisplay sentiment={results.sentiment} />
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                        <UserCircle2 className="h-5 w-5 text-primary" />
                        <span>Personality Insights</span>
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        {results.insights.split('. ').filter(s => s.length > 0).map((insight, index) => (
                            <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span>Tailored Feedback for Candidate</span>
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        {results.feedback.split('. ').filter(s => s.length > 0).map((fb, index) => (
                            <li key={index}>{fb}</li>
                        ))}
                      </ul>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
      </section>
    )
  );

  const renderSituationReactionResults = () => (
    situationResults && (
      <section className="space-y-6 animate-in fade-in-50 duration-500">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-primary">Situation Reaction Test: Evaluation</h2>
            <p className="text-muted-foreground mt-2">An analysis of your responses and decision-making patterns.</p>
            <Button onClick={startOver} variant="outline" className="mt-4">Start Over</Button>
        </div>

        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {situationResults.individualAnalyses.map((result, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-left flex-1">{result.situation}</span>
                      <div className="flex items-center gap-1 text-base font-semibold text-primary pr-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-500"/>
                        {result.report.rating}/10
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-2 space-y-4">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Quote className="h-5 w-5 text-primary"/> Your Response
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="italic">"{result.reaction}"</p>
                        </CardContent>
                     </Card>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <ArrowDownCircle className="h-5 w-5"/> Shortcomings
                            </CardTitle>
                            <CardDescription>Potential areas for development.</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                              {result.report.shortcomings.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </CardContent>
                        </Card>
                        <Card>
                           <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-green-600">
                                <ListChecks className="h-5 w-5"/> Constructive Suggestions
                              </CardTitle>
                              <CardDescription>Recommendations for a stronger response.</CardDescription>
                            </CardHeader>
                          <CardContent>
                             <ul className="list-disc pl-5 space-y-2 text-sm">
                                {result.report.improvements.map((item, i) => <li key={i}>{item}</li>)}
                              </ul>
                          </CardContent>
                        </Card>
                    </div>
                  </AccordionContent>
              </AccordionItem>
          ))}
        </Accordion>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                    <span>Final Evaluation Summary</span>
                </CardTitle>
                 <CardDescription>A holistic review by our AI Analysis Team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                        <UserCheck className="h-5 w-5 text-primary" />
                        <span>Overall Analysis</span>
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        {situationResults.overallAnalysis.split('. ').filter(s => s.length > 0).map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                        <ChevronsUp className="h-5 w-5 text-green-600" />
                        <span>Overall Improvements</span>
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        {situationResults.overallImprovements.split('. ').filter(s => s.length > 0).map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
      </section>
    )
  );

  const renderPPDTResults = () => (
    ppdtResults && (
      <section className="space-y-6 animate-in fade-in-50 duration-500">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-primary">PPDT: Evaluation Report</h2>
            <p className="text-muted-foreground mt-2">Prepared by our AI Analysis Team.</p>
            <Button onClick={startOver} variant="outline" className="mt-4">Start Over</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><Eye className="h-6 w-6 text-primary" />Image Analysis</CardTitle>
                    <CardDescription>Objective perception of the visual stimulus.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                   <ul className="list-disc pl-5 space-y-1">
                    {ppdtResults.imageAnalysis.analysis.split('. ').filter(s => s.length > 0).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><PenSquare className="h-6 w-6 text-primary" />Thematic Apperception</CardTitle>
                    <CardDescription>Insights from the narrative provided.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                   <ul className="list-disc pl-5 space-y-1">
                    {ppdtResults.storyAnalysis.thematicAnalysis.split('. ').filter(s => s.length > 0).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
            </Card>
        </div>
        
        <Card>
           <CardHeader>
                <CardTitle className="flex items-center gap-3"><Users className="h-6 w-6 text-primary" />Character & Plot Analysis</CardTitle>
                 <CardDescription>Evaluation of the story's structure and development.</CardDescription>
            </CardHeader>
             <CardContent>
                <p className="text-sm italic p-4 bg-muted rounded-md">"{ppdtResults.storyAnalysis.plotSummary}"</p>
            </CardContent>
        </Card>


        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3"><ClipboardCheck className="h-6 w-6 text-primary" />Psychological Evaluation</CardTitle>
                <CardDescription>Candidate's potential and areas for development.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <ArrowDownCircle className="h-5 w-5"/> Areas of Concern
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {ppdtResults.storyAnalysis.areasOfConcern.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                   <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <ChevronsUp className="h-5 w-5"/> Positive Qualities
                      </CardTitle>
                    </CardHeader>
                  <CardContent>
                     <ul className="list-disc pl-5 space-y-2 text-sm">
                        {ppdtResults.storyAnalysis.positiveQualities.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                  </CardContent>
                </Card>
            </CardContent>
        </Card>
      </section>
    )
  );
  
  const renderContent = () => {
    if (isLoading) {
      return renderLoadingScreen();
    }
    
    if (mode === 'welcome') {
      return renderWelcomeScreen();
    }

    if (testState === 'instructions') {
      return renderInstructionScreen();
    }

    if (testState === 'active') {
      if (mode === 'word-association' || mode === 'situation-reaction') {
        return renderTestUI();
      }
      if (mode === 'ppdt') {
        return renderPPDT_UI();
      }
    }
    
    if (testState === 'results') {
        if (mode === 'word-association' && results) {
            return renderWordAssociationResults();
        }
        if (mode === 'situation-reaction' && situationResults) {
            return renderSituationReactionResults();
        }
        if (mode === 'ppdt' && ppdtResults) {
            return renderPPDTResults();
        }
    }

    // Fallback to welcome if state is inconsistent
    startOver();
    return renderWelcomeScreen();
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 pt-24">
        <div className="w-full max-w-5xl space-y-8">
          {error && (
            <Alert variant="destructive" className="animate-in fade-in-50 duration-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {renderContent()}

        </div>
      </main>
      <Footer />
    </div>
  );
}
