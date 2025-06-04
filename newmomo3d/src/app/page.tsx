import ScrollSurferScene from '@/components/ScrollSurferScene';

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <ScrollSurferScene />
      {/* This div creates scrollable space. Adjust height for desired scroll range. */}
      <div style={{ height: '1000vh', position: 'relative', zIndex: 1 }}>
        {/* Optional: Add content sections here that appear as user scrolls */}
       
      </div>
    </main>
  );
}
