import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Check, X, Copy } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cash" | "debit" | "credit">("pix");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [pollingActive, setPollingActive] = useState(false);

  const createOrder = trpc.orders.create.useMutation();
  const createPixPayment = trpc.payments.createPixPayment.useMutation();
  const pollPaymentStatus = trpc.payments.pollPaymentStatus.useQuery(
    { paymentId: paymentId || "" },
    { enabled: pollingActive && !!paymentId, refetchInterval: 2000 }
  );
  const confirmPayment = trpc.payments.confirmPayment.useMutation();

  useEffect(() => {
    if (pollPaymentStatus.data?.approved) {
      setPaymentStatus("completed");
      setPollingActive(false);
      confirmPayment.mutate({ orderId: orderId!, paymentStatus: "completed" });
    }
  }, [pollPaymentStatus.data?.approved]);

  const handleCreateOrder = async () => {
    if (!customerEmail || !customerName) {
      toast.error("Please enter your email and name");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderResult = await createOrder.mutateAsync({
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price.toString(),
        })),
        subtotal: total.toString(),
        discount: "0",
        total: total.toString(),
      });

      setOrderId(orderResult.orderId);

      if (paymentMethod === "pix") {
        // Create PIX payment
        const pixResult = await createPixPayment.mutateAsync({
          orderId: orderResult.orderId,
          amount: total.toString(),
          description: `Order ${orderResult.orderNumber}`,
        });

        setPaymentId(pixResult.paymentId);
        setQrCode(pixResult.qrCode);
        setPollingActive(true);
      } else {
        // For cash/debit/credit, mark as completed
        await confirmPayment.mutateAsync({
          orderId: orderResult.orderId,
          paymentStatus: "completed",
        });
        setPaymentStatus("completed");
      }
    } catch (error) {
      toast.error("Failed to create order");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (paymentStatus === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-600 mb-6">Your order has been confirmed and is being prepared.</p>
          <div className="bg-slate-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-slate-600">Order ID</p>
            <p className="text-lg font-bold text-slate-900">ORD-{orderId}</p>
          </div>
          <Button
            onClick={() => {
              clearCart();
              window.location.href = "/menu";
            }}
            className="w-full"
          >
            Continue Shopping
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        <div className="grid gap-6">
          {/* Order Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-slate-600">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Customer Info */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Method</h2>
            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pix">PIX</TabsTrigger>
                <TabsTrigger value="cash">Cash</TabsTrigger>
                <TabsTrigger value="debit">Debit</TabsTrigger>
                <TabsTrigger value="credit">Credit</TabsTrigger>
              </TabsList>

              <TabsContent value="pix" className="mt-4">
                <p className="text-slate-600 mb-4">
                  Scan the QR code with your banking app to pay with PIX. Payment will be confirmed
                  automatically.
                </p>
              </TabsContent>

              <TabsContent value="cash" className="mt-4">
                <p className="text-slate-600">
                  Please pay the amount at the counter when your order is ready.
                </p>
              </TabsContent>

              <TabsContent value="debit" className="mt-4">
                <p className="text-slate-600">
                  Please use your debit card at the counter when your order is ready.
                </p>
              </TabsContent>

              <TabsContent value="credit" className="mt-4">
                <p className="text-slate-600">
                  Please use your credit card at the counter when your order is ready.
                </p>
              </TabsContent>
            </Tabs>
          </Card>

          {/* PIX QR Code Display */}
          {paymentMethod === "pix" && qrCode && (
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Scan to Pay</h2>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <img src={qrCode} alt="PIX QR Code" className="w-64 h-64" />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(qrCode);
                    toast.success("QR Code copied!");
                  }}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy QR Code
                </Button>
                {pollingActive && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Waiting for payment confirmation...</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleCreateOrder}
            disabled={loading || cart.length === 0}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 h-12 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              `Complete Order - R$ ${total.toFixed(2)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
