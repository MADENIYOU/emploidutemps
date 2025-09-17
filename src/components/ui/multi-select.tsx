//@ts-nocheck
import { Check, PlusCircle, X, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MultiSelectProps {
  options: {
    label: string;
    value: string;
  }[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, selected, onChange, placeholder, className, ...props }, ref) => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleSelect = (value: string) => {
      if (!selected.includes(value)) {
        onChange([...selected, value]);
      }
      setInputValue("");
    };

    const handleUnselect = (value: string) => {
      onChange(selected.filter((s) => s !== value));
    };

    const filteredOptions = options.filter(
      (option) => !selected.includes(option.value)
    );

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
            <div 
                ref={ref as any} 
                onClick={() => setIsPopoverOpen(!isPopoverOpen)} 
                className={cn("flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
            >
                {selected.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {selected.map((value) => {
                            const label = options.find(o => o.value === value)?.label || value;
                            return (
                                <Badge key={value} variant="secondary">
                                {label}
                                <button
                                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={() => handleUnselect(value)}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                                </Badge>
                            );
                        })}
                    </div>
                ) : (
                    <span className="text-muted-foreground">{placeholder || "Select..."}</span>
                )}
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput
              placeholder="Rechercher ou créer..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              {inputValue && filteredOptions.length === 0 && (
                <CommandEmpty>
                    <CommandItem 
                        onSelect={() => handleSelect(inputValue)} 
                        className="cursor-pointer flex items-center">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Créer "{inputValue}"
                    </CommandItem>
                </CommandEmpty>
              )}
              {inputValue.length > 0 && (
                <CommandGroup heading="Suggestions">
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="cursor-pointer"
                    >
                      <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            selected.includes(option.value)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };