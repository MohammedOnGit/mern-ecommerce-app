import React, { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, Filter, X } from "lucide-react";
import { filterOptions } from "@/config";
import { cn } from "@/lib/utils";

function ProductFilter({ filters = {}, handleFilter, onClearFilters }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  /* ---------------- derived state ---------------- */

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).reduce(
      (sum, value) => sum + (Array.isArray(value) ? value.length : 0),
      0
    );
  }, [filters]);

  /* ---------------- helpers ---------------- */

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: prev[key] === false,
    }));
  };

  const isExpanded = (key) => expandedSections[key] !== false;

  /* ---------------- shared content ---------------- */

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        {Object.entries(filterOptions).map(([key, options]) => {
          const selectedCount = filters[key]?.length || 0;

          return (
            <div key={key} className="space-y-3">
              <button
                onClick={() => toggleSection(key)}
                className="flex w-full items-center justify-between rounded-md p-2 hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">{key}</span>
                  {selectedCount > 0 && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      {selectedCount}
                    </Badge>
                  )}
                </div>
                {isExpanded(key) ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isExpanded(key) && (
                <div className="space-y-2 pl-2">
                  {options.map((option, index) => {
                    const id = option.id || option;
                    const label = option.label || option;
                    const checked = filters[key]?.includes(id);

                    return (
                      <div
                        key={`${key}-${index}`}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/30"
                      >
                        <Checkbox
                          id={`${key}-${index}`}
                          checked={checked}
                          onCheckedChange={() => handleFilter(key, id)}
                        />
                        <label
                          htmlFor={`${key}-${index}`}
                          className={cn(
                            "text-sm cursor-pointer flex-1",
                            checked
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}

              <Separator className="opacity-30" />
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );

  /* ---------------- render ---------------- */

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden sticky top-16 z-40 bg-background border-b">
        <div className="px-4 py-2">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile panel */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <span className="font-semibold">Filters</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileFiltersOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <FilterContent />
            </div>

            <div className="border-t p-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onClearFilters}
                disabled={activeFilterCount === 0}
              >
                Clear all
              </Button>
              <Button onClick={() => setIsMobileFiltersOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden lg:block sticky top-24">
        <div className="w-64 rounded-lg border bg-card p-5 shadow-sm">
          <FilterContent />
        </div>
      </div>
    </>
  );
}

export default ProductFilter;
