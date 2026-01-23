import React from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { 
  MapPin, Phone, Hash, FileText, CheckCircle,
  Edit2, Trash2, Star, Copy, Home, Building2, Navigation, CheckCheck
} from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

function AddressCard({ 
  addressInfo, 
  setFormData, 
  handleDeleteAddress,
  isDefault = false,
  onSetDefault,
  isSelected = false,
  className
}) {
  const { address, city, phone, digitalAddress, notes, type = "home", _id } = addressInfo;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${address}, ${city}, ${digitalAddress}`);
  };

  const typeConfig = {
    home: { label: "Home", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Home },
    work: { label: "Work", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: Building2 },
    other: { label: "Other", color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200", icon: MapPin }
  };

  const { label, color, bg, border, icon: Icon } = typeConfig[type] || typeConfig.home;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg group border hover:border-primary/50",
      isDefault && "ring-2 ring-primary ring-offset-2",
      isSelected && "ring-2 ring-green-500 ring-offset-2 border-green-300",
      className
    )}>
      {/* Badges */}
      {(isSelected || isDefault) && (
        <div className="absolute top-3 right-3 z-10 flex gap-1">
          {isSelected && (
            <Badge className="gap-1 bg-green-500 text-white border-0">
              <CheckCheck className="h-3 w-3" /> Selected
            </Badge>
          )}
          {isDefault && !isSelected && (
            <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              <Star className="h-3 w-3 fill-white" /> Default
            </Badge>
          )}
        </div>
      )}

      {/* Type Indicator */}
      <div className={cn("absolute top-0 left-0 h-full w-1.5", bg)} />

      <CardContent className="pt-6 pb-4 px-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center border", bg, border)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          <Badge variant="outline" className={cn("text-xs", color, border)}>{label}</Badge>
        </div>

        {/* Address Details */}
        <div className="space-y-3 ml-1">
          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5 flex-1">
              <p className="font-medium text-sm leading-tight break-words">{address}</p>
              <p className="text-sm text-muted-foreground">{city}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a 
              href={`tel:${phone}`}
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {phone}
            </a>
          </div>

          {/* Digital Address */}
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <code className="text-xs font-mono bg-muted/30 px-2 py-1 rounded truncate max-w-[70%]">
                {digitalAddress}
              </code>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); handleCopy(); }} aria-label="Copy digital address">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="flex items-start gap-2 pt-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Delivery Notes</p>
                <p className="text-sm bg-amber-50 text-amber-900 px-3 py-2 rounded-lg border border-amber-200">{notes}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="px-5 pb-5 pt-0 flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2" onClick={e => { e.stopPropagation(); setFormData({ ...addressInfo }); }}>
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="destructive" size="sm" className="flex-1 sm:flex-none gap-2" onClick={e => { e.stopPropagation(); handleDeleteAddress(_id); }}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>

        {!isDefault && onSetDefault && (
          <Button variant="ghost" size="sm" className="flex-1 sm:flex-none gap-2 text-primary" onClick={e => { e.stopPropagation(); onSetDefault(_id); }}>
            <CheckCircle className="h-3.5 w-3.5" /> Set Default
          </Button>
        )}

        {/* Quick Actions for small screens */}
        <div className="flex gap-2 w-full sm:w-auto sm:hidden">
          <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={e => { e.stopPropagation(); handleCopy(); }}>
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-2" onClick={e => { e.stopPropagation(); window.open(`https://maps.google.com/?q=${encodeURIComponent(`${address}, ${city}`)}`, '_blank'); }}>
            <Navigation className="h-3.5 w-3.5" /> Map
          </Button>
        </div>
      </CardFooter>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
}

export default AddressCard;
