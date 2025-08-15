import { sendOrderNotification } from '@/services/notificationService';
import { useAuth } from '@/store/useAuth';
import { useStore } from '@/store/useStore';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, CreditCard, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutScreen() {
    const { cart, getCartTotal, clearCart, addOrder } = useStore();
    const { } = useAuth();
    const [selectedAddress, setSelectedAddress] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderNotes, setOrderNotes] = useState('');

    const cartTotal = getCartTotal();
    const deliveryFee = 50;
    const tax = Math.round(cartTotal * 0.18);
    const finalTotal = cartTotal + deliveryFee + tax;

    const addresses = [
        '123 Main Street, New Delhi, 110001',
        '456 Park Avenue, Mumbai, 400001',
        '789 Garden Road, Bangalore, 560001'
    ];

    const paymentMethods = [
        { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
        { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
        { id: 'upi', name: 'UPI Payment', icon: '📱' },
        { id: 'wallet', name: 'Digital Wallet', icon: '💰' }
    ];

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
        }

        if (!selectedPayment) {
            Alert.alert('Error', 'Please select a payment method');
            return;
        }

        setIsProcessing(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            const order = {
                items: cart,
                total: finalTotal,
                status: 'pending' as const,
                deliveryAddress: selectedAddress,
                paymentMethod: selectedPayment,
                notes: orderNotes
            };

            addOrder(order);
            clearCart();

            // Send push notification
            await sendOrderNotification('pending', `CS${Date.now()}`);

            Alert.alert(
                'Order Placed Successfully!',
                `Your order has been placed successfully. Order total: ₹${finalTotal.toLocaleString()}`,
                [
                    {
                        text: 'View Orders',
                        onPress: () => router.replace('/orders')
                    },
                    {
                        text: 'Continue Shopping',
                        onPress: () => router.replace('/(tabs)')
                    }
                ]
            );
        } catch {
            Alert.alert('Error', 'Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkout</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Your cart is empty</Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text style={styles.shopButtonText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right']}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkout</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Order Summary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                        {cart.map((item, index) => (
                            <View key={index} style={styles.orderItem}>
                                <View style={styles.orderItemInfo}>
                                    <Text style={styles.orderItemName}>{item.product.title}</Text>
                                    <Text style={styles.orderItemDetails}>
                                        Size: {item.selectedSize} | Color: {item.selectedColor} | Qty: {item.quantity}
                                    </Text>
                                </View>
                                <Text style={styles.orderItemPrice}>₹{(item.product.price * item.quantity).toLocaleString()}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Delivery Address */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MapPin size={20} color="#3742fa" />
                            <Text style={styles.sectionTitle}>Delivery Address</Text>
                        </View>
                        {addresses.map((address, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.addressOption,
                                    selectedAddress === address && styles.selectedOption
                                ]}
                                onPress={() => setSelectedAddress(address)}
                            >
                                <View style={styles.radioButton}>
                                    {selectedAddress === address && <View style={styles.radioButtonInner} />}
                                </View>
                                <Text style={styles.addressText}>{address}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Payment Method */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <CreditCard size={20} color="#3742fa" />
                            <Text style={styles.sectionTitle}>Payment Method</Text>
                        </View>
                        {paymentMethods.map((method) => (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.paymentOption,
                                    selectedPayment === method.id && styles.selectedOption
                                ]}
                                onPress={() => setSelectedPayment(method.id)}
                            >
                                <View style={styles.radioButton}>
                                    {selectedPayment === method.id && <View style={styles.radioButtonInner} />}
                                </View>
                                <Text style={styles.paymentIcon}>{method.icon}</Text>
                                <Text style={styles.paymentText}>{method.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Order Notes */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Add any special instructions..."
                            value={orderNotes}
                            onChangeText={setOrderNotes}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Price Breakdown */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Price Details</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal</Text>
                            <Text style={styles.priceValue}>₹{cartTotal.toLocaleString()}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Delivery Fee</Text>
                            <Text style={styles.priceValue}>₹{deliveryFee}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Tax (18%)</Text>
                            <Text style={styles.priceValue}>₹{tax.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.priceRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{finalTotal.toLocaleString()}</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.placeOrderButton, isProcessing && styles.disabledButton]}
                        onPress={handlePlaceOrder}
                        disabled={isProcessing}
                    >
                        <CheckCircle size={20} color="#fff" />
                        <Text style={styles.placeOrderText}>
                            {isProcessing ? 'Processing...' : `Place Order • ₹${finalTotal.toLocaleString()}`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    orderItemInfo: {
        flex: 1,
    },
    orderItemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    orderItemDetails: {
        fontSize: 12,
        color: '#666',
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    addressOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
    },
    selectedOption: {
        backgroundColor: '#e8f2ff',
        borderWidth: 1,
        borderColor: '#3742fa',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3742fa',
    },
    addressText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    paymentIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    paymentText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#333',
        textAlignVertical: 'top',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    priceValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        marginTop: 8,
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3742fa',
    },
    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    placeOrderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3742fa',
        paddingVertical: 16,
        borderRadius: 12,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    placeOrderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: '#3742fa',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});