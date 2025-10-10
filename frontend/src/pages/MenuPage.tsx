import { useState } from "react";
import { Plus, Minus, ShoppingCart, Leaf, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFoodCategories } from "@/hooks/useFoodCategories";
import { useFoodItems } from "@/hooks/useFoodItems";
import { useCartStore } from "@/store/cartStore";
import { useNavigate } from "react-router-dom";

const MenuPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } =
    useFoodCategories();
  const { data: items = [], isLoading: itemsLoading } = useFoodItems(
    selectedCategory === "all" ? undefined : selectedCategory
  );

  const {
    foodItems: cartItems,
    addFoodToCart,
    removeFoodFromCart,
    updateFoodQuantity,
    clearFoodCart,
    getFoodTotalPrice,
    getFoodItemCount,
  } = useCartStore();

  const handleAddToCart = (item: any) => {
    addFoodToCart({
      foodItemId: item.id,
      name: item.name,
      price: parseFloat(item.price),
      quantity: 1,
      image: item.image,
    });
  };

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cartItems.find((item) => item.foodItemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    const cartItem = cartItems.find((item) => item.foodItemId === itemId);
    if (cartItem) {
      updateFoodQuantity(cartItem.id, quantity);
    }
  };

  const removeFromCart = (itemId: string) => {
    const cartItem = cartItems.find((item) => item.foodItemId === itemId);
    if (cartItem) {
      removeFoodFromCart(cartItem.id);
    }
  };

  if (categoriesLoading || itemsLoading) {
    return <div>Loading menu...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Restaurant Menu
            </h1>
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
              <DialogTrigger asChild>
                <Button className="relative">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart
                  {getFoodItemCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500">
                      {getFoodItemCount()}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Your Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {cartItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <>
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.foodItemId,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.foodItemId,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(item.foodItemId)}
                              className="text-red-600"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total: ${getFoodTotalPrice().toFixed(2)}</span>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Label htmlFor="instructions">
                            Special Instructions
                          </Label>
                          <Textarea
                            id="instructions"
                            value={specialInstructions}
                            onChange={(e) =>
                              setSpecialInstructions(e.target.value)
                            }
                            placeholder="Any dietary requirements or special requests..."
                            rows={3}
                          />
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => clearFoodCart()}
                            className="flex-1"
                          >
                            Clear Cart
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => navigate("/food-checkout")}
                          >
                            Proceed to Checkout
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-auto mb-8">
            <TabsTrigger value="all">All Items</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <span className="text-lg font-bold text-green-600">
                        ${parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.isVegetarian && (
                        <Badge variant="outline" className="text-green-600">
                          <Leaf className="h-3 w-3 mr-1" />
                          Vegetarian
                        </Badge>
                      )}
                      {item.isVegan && (
                        <Badge variant="outline" className="text-green-700">
                          <Leaf className="h-3 w-3 mr-1" />
                          Vegan
                        </Badge>
                      )}
                      {item.isGlutenFree && (
                        <Badge variant="outline" className="text-orange-600">
                          <Wheat className="h-3 w-3 mr-1" />
                          Gluten Free
                        </Badge>
                      )}
                      {item.preparationTime && (
                        <Badge variant="outline">
                          {item.preparationTime} min
                        </Badge>
                      )}
                    </div>

                    {item.allergens && (
                      <p className="text-xs text-red-600 mb-4">
                        <strong>Allergens:</strong> {item.allergens}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      {getItemQuantityInCart(item.id) > 0 ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.id,
                                getItemQuantityInCart(item.id) - 1
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">
                            {getItemQuantityInCart(item.id)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.id,
                                getItemQuantityInCart(item.id) + 1
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.isAvailable}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          {item.isAvailable ? "Add to Cart" : "Unavailable"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MenuPage;
