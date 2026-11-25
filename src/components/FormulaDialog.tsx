import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiFormula as FormulaIcon } from "react-icons/ri";

export function FormulaDialog() {
  return (
    <Dialog>
      <form>
        <DialogTrigger
          render={<Button variant="outline" size={'icon'}><FormulaIcon /></Button>}
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Review Formulas</DialogTitle>
            <DialogDescription>
              Review formulas here. Render the math formulas here soon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Exit</Button>} />
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
