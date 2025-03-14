import React from "react";
import useOrder from "../../hooks/orders/useOrder";
import { useSelector } from "react-redux";
import Spinner from "../../components/loading/Spinner";
import { notify } from "../../utils/helper/notification";
import PaymentComponent from "../../components/payment/PaymentComponent";

const PaymentCard = ({
  totalAmount,
  limitForFreeDelivery,
  deliveryCharge,
  customerLatitude,
  customerLongitude,
}) => {
  const cartData = useSelector((state) => state.cartReducer);

  const { orderProduct, isLoading: isPaymentInitiated } = useOrder();

  const orderNow = async () => {
    if (customerLatitude === null || customerLongitude === null) {
      notify("Please select and submit valid delivery location", "info");
      return;
    }

    const orderData = [];
    for (const element of cartData) {
      orderData.push({
        productId: element._id,
        orderQty: element.qty,
        orderLocation: {
          latitude: customerLatitude,
          longitude: customerLongitude,
        },
        sellerId: element.sellerId,
      });
    }

    // console.log("Order data:", orderData);

    orderProduct(orderData);
  };

  return (
    <div className="flex flex-col justify-center px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50  space-y-6">
      <h3 className="text-xl  font-semibold leading-5 text-gray-800">
        Shipping
      </h3>
      <div className="flex justify-between items-start w-full">
        <div className="flex justify-center items-center space-x-4">
          <div className="w-8 h-8">
            <img
              loading="lazy"
              className="w-full h-full"
              alt="logo"
              src="https://i.ibb.co/L8KSdNQ/image-3.png"
            />
          </div>
          <div className="flex flex-col justify-start items-center">
            <p className="text-lg leading-6  font-semibold text-gray-800">
              CropConnect
              <br />
              <span className="font-normal">Delivery within 24 Hours</span>
            </p>
          </div>
        </div>
        <p className="text-lg font-semibold leading-6  text-gray-800">
          Rs.
          {totalAmount +
            (totalAmount >= limitForFreeDelivery ? 0 : deliveryCharge)}
          .00
        </p>
      </div>
      <div className="w-full flex justify-center items-center">
        <PaymentComponent totalAmount={totalAmount} orderProduct={orderProduct} cartData={cartData} />
      </div>
    </div>
  );
};

export default PaymentCard;