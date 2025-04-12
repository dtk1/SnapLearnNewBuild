"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function VersionSwitcher({
  versions,
  defaultVersion,
}: {
  versions: string[]
  defaultVersion: string
}) {
  const [open, setOpen] = React.useState(false)
  const [selectedVersion, setSelectedVersion] = React.useState(defaultVersion)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedVersion}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search version..." />
          <CommandList>
            <CommandEmpty>No version found.</CommandEmpty>
            <CommandGroup>
              {versions.map((version) => (
                <CommandItem
                  key={version}
                  onSelect={() => {
                    setSelectedVersion(version)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedVersion === version ? "opacity-100" : "opacity-0")} />
                  {version}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

