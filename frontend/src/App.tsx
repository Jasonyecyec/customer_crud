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

function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [customers, setCustomers] = useState<CustomerResponse[] | null>([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [newCustomer, setNewCustomer] = useState<Customer>({
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
  });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomers(searchCustomer);
      setCustomers(data);
      console.log(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  // handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      // setError(null);
      if (editingCustomer) {
        // Update
        // const updated = await updateCustomer(editingCustomer.id!, {
        //   ...editingCustomer,
        //   ...newCustomer,
        // });
        // setCustomers(customers.map((c) => (c.id === updated.id ? updated : c)));
        // setEditingCustomer(null);
      } else {
        // Create
        const created = await createCustomer(newCustomer);
        if (created) {
          loadCustomers();
        }
      }
      console.log(newCustomer);
      // setNewCustomer({ first_name: "", last_name: "", email: "", contact_number: "" });
    } catch (err) {
      // setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setCreating(false);
    }
  };

  // Handle edit
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      contact_number: customer.contact_number,
    });
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      // setError(null);
      await deleteCustomer(id);
      setCustomers(customers && customers.filter((c) => c.id !== id));
    } catch (err) {
      // setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchCustomer]);

  return (
    <>
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Add New</Button>
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
                      <Button type="submit" className="cursor-pointer">
                        {creating ? <LoaderCircle className="animate-spin h-14 w-14 text-gray-400" /> : "Save changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-10 ">
            {loading ? (
              <div className="text-center w-full flex flex-col justify-center items-center">
                <LoaderCircle className="animate-spin h-14 w-14 text-gray-400" />
                <p className="text-gray-400">Loading data ...</p>
              </div>
            ) : customers && customers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {customers.map((customer, index) => (
                  <Card
                    key={index}
                    className="rounded-lg shadow border border-gray-200 hover:shadow-md transition duration-300 ease-in-out">
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-50">
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
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(customer.id!)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* View Button */}
                      <Button className="cursor-pointer text-xs h-8 bg-blue-500 text-white hover:bg-blue-600">
                        View
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center w-full flex flex-col justify-center items-center">
                <p className="text-gray-400 text-lg">⚠️ No data available.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
