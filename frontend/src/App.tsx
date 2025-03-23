import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from "./services/api";
import { Customer, CustomerResponse } from "./types/customer";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import useDebounce from "./hooks/useDebounce";

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  const [addNewModal, setAddNewModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);

  const [customers, setCustomers] = useState<CustomerResponse[] | null>([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [currentCustomer, setCurrentCustomer] = useState<CustomerResponse | null>(null);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
  });

  // Debounce search input
  const debouncedSearch = useDebounce(searchCustomer, 500);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomers(searchCustomer);
      setCustomers(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);

      const created = await createCustomer(newCustomer);

      if (created) {
        toast.success("Successfully created new user!");
        loadCustomers();
      }

      setNewCustomer({ first_name: "", last_name: "", email: "", contact_number: "" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCreating(false);
      setAddNewModal(false);
    }
  };

  // Handle edit
  const handleEdit = async () => {
    try {
      if (!currentCustomer) return;

      setEditing(true);
      const { created_at, updated_at, id, ...updatedCustomer } = currentCustomer;

      const updated = await updateCustomer(currentCustomer.id, updatedCustomer);
      if (updated) {
        loadCustomers();
        toast.success("Customer updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setEditing(false);
      setEditModal(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setDeleting(true);

      await deleteCustomer(id);
      setCustomers(customers && customers.filter((c) => c.id !== id));
      toast.success("Deleted successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [debouncedSearch]);

  return (
    <>
      <Toaster position="top-right" richColors />

      <main className="container p-20">
        <div className="mx-auto max-w-7xl space-y-10">
          <h1 className="text-center text-3xl font-bold">List of Customers</h1>
          <div className="max-w-3xl mx-auto flex space-x-10">
            <Input
              placeholder="Search customer name, email ..."
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
            />
            <div className="flex space-x-3">
              <Button className="cursor-pointer ">Search</Button>
              <Dialog open={addNewModal} onOpenChange={setAddNewModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setAddNewModal(true)}>
                    Add New
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="cursor-pointer">Add new customer</DialogTitle>
                    <DialogDescription>Fill in the details below. Click save when you're done.</DialogDescription>
                  </DialogHeader>

                  {/* Move form inside DialogContent */}
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="first_name" className="text-right">
                          First name
                        </Label>
                        <Input
                          id="first_name"
                          placeholder="First name"
                          value={newCustomer.first_name}
                          className="col-span-3"
                          required
                          onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="last_name" className="text-right">
                          Last name
                        </Label>
                        <Input
                          id="last_name"
                          value={newCustomer.last_name}
                          className="col-span-3"
                          required
                          onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          value={newCustomer.email}
                          className="col-span-3"
                          required
                          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contact_number" className="text-right">
                          Contact no
                        </Label>
                        <Input
                          id="contact_number"
                          value={newCustomer.contact_number}
                          className="col-span-3"
                          required
                          onChange={(e) => setNewCustomer({ ...newCustomer, contact_number: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Submit button inside DialogFooter */}
                    <DialogFooter>
                      <Button type="submit" className="cursor-pointer w-32 text-center" disabled={creating}>
                        {creating ? <LoaderCircle className="animate-spin h-14 w-14 text-gray-400" /> : "Save changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-10">
            {loading ? (
              <div className="col-span-full flex justify-center items-center h-30">
                <div className="flex flex-col justify-center items-center space-y-2">
                  <LoaderCircle className="animate-spin h-10 w-10 text-gray-400" />
                  <p className="text-gray-400 text-sm">Loading data ...</p>
                </div>
              </div>
            ) : customers && customers.length > 0 ? (
              <>
                {customers.map((customer, index) => (
                  <Card
                    key={index}
                    className="rounded-lg shadow border w-60 border-gray-200 hover:shadow-md transition duration-300 ease-in-out">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg font-semibold text-gray-700 capitalize">
                        {customer.first_name} {customer.last_name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        📧 <span className="font-medium">{customer.email}</span>
                      </p>
                      <p className="text-sm text-gray-600">📞 {customer.contact_number || "N/A"}</p>
                    </CardContent>

                    <CardFooter className="flex justify-between p-4">
                      {/* Delete Button with Confirmation */}
                      <AlertDialog open={deleteModal} onOpenChange={setDeleteModal}>
                        <AlertDialogTrigger asChild>
                          <Button
                            onClick={() => setDeleteModal(true)}
                            variant="outline"
                            className="text-red-500 text-xs h-8 border-red-500 hover:bg-red-50">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this customer and remove the
                              data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(customer.id!);
                              }}
                              className="w-32 cursor-pointer">
                              {deleting ? (
                                <LoaderCircle className="animate-spin h-14 w-14 text-gray-400" />
                              ) : (
                                "Continue"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* View Button */}
                      <Dialog open={editModal} onOpenChange={setEditModal}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCurrentCustomer(customer);
                              setEditModal(true);
                            }}
                            className="cursor-pointer text-xs h-8 bg-blue-500 text-white hover:bg-blue-600">
                            View
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="cursor-pointer">Edit Customer</DialogTitle>
                            <DialogDescription>Edit the details below. Click save when you're done.</DialogDescription>
                          </DialogHeader>

                          {/* Move form inside DialogContent */}
                          <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="first_name" className="text-right">
                                  First name
                                </Label>
                                <Input
                                  id="first_name"
                                  placeholder="First name"
                                  value={currentCustomer?.first_name}
                                  className="col-span-3"
                                  required
                                  onChange={(e) => {
                                    if (currentCustomer) {
                                      setCurrentCustomer({
                                        ...currentCustomer,
                                        first_name: e.target.value,
                                      });
                                    }
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="last_name" className="text-right">
                                  Last name
                                </Label>
                                <Input
                                  id="last_name"
                                  value={currentCustomer?.last_name}
                                  className="col-span-3"
                                  required
                                  onChange={(e) => {
                                    if (currentCustomer) {
                                      setCurrentCustomer({
                                        ...currentCustomer,
                                        last_name: e.target.value,
                                      });
                                    }
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                  Email
                                </Label>
                                <Input
                                  id="email"
                                  value={currentCustomer?.email}
                                  className="col-span-3"
                                  required
                                  onChange={(e) => {
                                    if (currentCustomer) {
                                      setCurrentCustomer({
                                        ...currentCustomer,
                                        email: e.target.value,
                                      });
                                    }
                                  }}
                                />
                              </div>

                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="contact_number" className="text-right">
                                  Contact no
                                </Label>
                                <Input
                                  id="contact_number"
                                  value={currentCustomer?.contact_number}
                                  className="col-span-3"
                                  required
                                  onChange={(e) => {
                                    if (currentCustomer) {
                                      setCurrentCustomer({
                                        ...currentCustomer,
                                        contact_number: e.target.value,
                                      });
                                    }
                                  }}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="contact_number" className="text-right">
                                  Date created
                                </Label>
                                <Input
                                  id="contact_number"
                                  value={new Date(currentCustomer?.created_at || "").toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  className="col-span-3"
                                  disabled
                                />
                              </div>
                            </div>

                            {/* Submit button inside DialogFooter */}
                            <DialogFooter>
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEdit();
                                }}
                                type="submit"
                                disabled={editing}
                                className="cursor-pointer w-32 text-center">
                                {editing ? (
                                  <LoaderCircle className="animate-spin h-14 w-14 text-gray-400" />
                                ) : (
                                  "Save changes"
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
              </>
            ) : (
              <div className="col-span-full flex justify-center items-center h-30">
                <div className="flex flex-col justify-center items-center space-y-2">
                  <p className="text-gray-400 text-lg">⚠️ No data available.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
