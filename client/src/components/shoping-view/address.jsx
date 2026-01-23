
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import CommonForm from "../common/form";
import AddressCard from "./address-card";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import { addNewAddress, fetchAllAddresses, editAnAddress, deleteAddress } from "@/store/shop/address-slice";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Plus, MapPin, AlertCircle, Search, CheckCircle } from "lucide-react";
import { Input } from "../ui/input";

const initialAddressFormData = {
  _id: null,
  address: "",
  city: "",
  phone: "",
  digitalAddress: "",
  notes: "",
  type: "home",
};

function Address({ onAddressSelect }) {
  const dispatch = useDispatch();
  const { addressList, isLoading } = useSelector((state) => state.shopAddress);
  const lastFetchRef = useRef(0);
  const fetchCooldown = 15000;

  const [formData, setFormData] = useState(initialAddressFormData);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Fetch addresses with cooldown
  useEffect(() => {
    if (Date.now() - lastFetchRef.current < fetchCooldown) return;
    lastFetchRef.current = Date.now();
    dispatch(fetchAllAddresses());
  }, [dispatch]);

  // Auto-select first address
  useEffect(() => {
    if (addressList.length > 0 && !selectedAddressId && onAddressSelect) {
      const firstAddress = addressList[0];
      setSelectedAddressId(firstAddress._id);
      onAddressSelect(firstAddress);
    }
  }, [addressList, onAddressSelect]);

  const filteredAddresses = addressList.filter((addr) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return [addr.address, addr.city, addr.digitalAddress, addr.phone, addr.notes]
      .some((field) => field?.toLowerCase().includes(q));
  });

  const isFormValid = () =>
    formData.address?.trim() && formData.city?.trim() && formData.phone?.trim() && formData.digitalAddress?.trim();

  const isValidPhone = (phone) => /^[0-9\-\+\s\(\)]{10,15}$/.test(phone);
  const isValidDigitalAddress = (addr) => addr.length >= 3 && addr.length <= 20;

  const handleManageAddress = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return toast.error("Please fill in all required fields");
    if (!isValidPhone(formData.phone)) return toast.error("Please enter a valid phone number (10-15 digits)");
    if (!isValidDigitalAddress(formData.digitalAddress)) return toast.error("Digital address must be 3-20 chars");
    if (!formData._id && addressList.length >= 3) return toast.warning("You can only add up to 3 addresses");

    try {
      if (formData._id) {
        await dispatch(editAnAddress({ addressId: formData._id, formData })).unwrap();
        toast.success("Address updated successfully");
      } else {
        await dispatch(addNewAddress(formData)).unwrap();
        toast.success("Address added successfully");
      }
      setFormData(initialAddressFormData);
      setIsAddingNew(false);
      lastFetchRef.current = 0; // invalidate cache
    } catch (err) {
      toast.error(err?.message || "Operation failed");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await dispatch(deleteAddress(addressId)).unwrap();
      toast.success("Address deleted successfully");

      if (formData._id === addressId) setFormData(initialAddressFormData);
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        onAddressSelect?.(null);
      }
      lastFetchRef.current = 0;
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = () => toast.info("Default address feature coming soon");
  const handleAddressClick = (addr) => {
    setSelectedAddressId(addr._id);
    onAddressSelect?.(addr);
  };
  const isAddLimitReached = !formData._id && addressList.length >= 3;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">My Addresses</CardTitle>
            <CardDescription>
              {onAddressSelect ? "Select a shipping address for checkout" : "Manage your delivery addresses"}
            </CardDescription>
          </div>
          {!isAddingNew && addressList.length < 3 && (
            <Button onClick={() => setIsAddingNew(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add New Address
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Selected Info */}
        {onAddressSelect && selectedAddressId && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">Address selected for checkout</p>
          </div>
        )}

        {/* Search */}
        {addressList.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search addresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Address Limit */}
        {addressList.length >= 3 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Address Limit Reached</p>
              <p className="text-sm text-amber-700">
                You can only store up to 3 addresses. Delete an existing address to add a new one.
              </p>
            </div>
          </div>
        )}

        {/* Address List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading addresses...</p>
          </div>
        ) : filteredAddresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAddresses.map((addr) => (
              <div key={addr._id} onClick={() => onAddressSelect && handleAddressClick(addr)} className="cursor-pointer">
                <AddressCard
                  addressInfo={addr}
                  setFormData={(data) => {
                    setFormData(data);
                    setIsAddingNew(true);
                  }}
                  handleDeleteAddress={handleDeleteAddress}
                  isDefault={addr.isDefault}
                  onSetDefault={handleSetDefault}
                  isSelected={onAddressSelect && selectedAddressId === addr._id}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No matching addresses" : "No addresses saved"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {searchQuery ? "Try adjusting your search term." : "Add your delivery addresses for faster checkout"}
            </p>
            {!searchQuery && addressList.length < 3 && (
              <Button onClick={() => setIsAddingNew(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Your First Address
              </Button>
            )}
          </div>
        )}

        {/* Address Form */}
        {(isAddingNew || formData._id) && (
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{formData._id ? "Edit Address" : "Add New Address"}</h3>
              <Button variant="ghost" size="sm" onClick={() => { setFormData(initialAddressFormData); setIsAddingNew(false); }}>
                Cancel
              </Button>
            </div>
            <CommonForm
              formControls={addressFormControls}
              formData={formData}
              setFormData={setFormData}
              buttonText={formData._id ? "Update Address" : "Save Address"}
              onSubmit={handleManageAddress}
              isBtnDisabled={!isFormValid() || isLoading || isAddLimitReached}
              loading={isLoading}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Address;
