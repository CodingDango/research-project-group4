import { useState } from "react";
import { Button } from "./components/ui/button";
import "./App.css";

function App() {
  const [count, setCount] = useState(67);

  return (
    <div className="bg-background text-foreground min-h-screen p-6">
      <div className="mt-12 flex flex-col gap-6">
        <div className="p-6 mx-auto flex items-center flex-col gap-4 w-full max-w-lg bg-card rounded-lg border">
          <img src="https://avatars.githubusercontent.com/u/182408519?v=4" className="h-24 w-24 rounded-lg"></img>
          <h1 className="text-xl font-semibold">CodingDango</h1>
        </div>
        <div className="p-6 mx-auto flex items-center flex-col w-full max-w-lg bg-card rounded-lg border text-center">
          <h2 className="text-4xl font-bold mb-3">Hello Research Project!</h2>
          <p className="text-muted-foreground mb-12">
            I dont know what to put here.
          </p>

          <Button
            type="button"
            className="counter w-full"
            onClick={() => setCount((count) => count + 1)}
          >
            Count is {count}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
