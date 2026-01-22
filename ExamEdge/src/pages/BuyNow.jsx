import { useParams } from "react-router-dom";
import courses from "../data/courses.json";
import instructors from "../data/instructors.json";
import Navbar from "../components/Navbar";
import "./BuyNow.css";

const BuyNow = () => {
  const { courseId } = useParams();

  const course = courses.find(c => c.id === courseId);
  const instructor = instructors.find(
    i => i.id === course?.instructorId
  );

  if (!course) return <div className="buy-page"><Navbar /><p style={{textAlign: 'center', marginTop: '50px'}}>Course not found</p></div>;

  return (
    <div className="buy-page">
      <Navbar />

      <div className="buy-container">
        <h1 className="buy-title">Checkout</h1>

        <div className="buy-layout">

          {/* LEFT: FORM */}
          <div className="buy-form">

            <div className="buy-box">
              <h3>User Information</h3>
              <div className="form-row two-col">
                <input placeholder="Full Name" />
                <input placeholder="Email Address" />
              </div>
            </div>

            <div className="buy-box">
              <h3>Billing Address</h3>
              <div className="form-row three-col">
                <input placeholder="City" />
                <input placeholder="State" />
                <input placeholder="Country" />
              </div>
            </div>

            <div className="buy-box">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <label>
                  <input type="radio" name="payment" value="upi" defaultChecked />
                  <span>UPI Payment (PhonePe, GPay, etc.)</span>
                </label>
                <label>
                  <input type="radio" name="payment" value="card" />
                  <span>Credit / Debit Card</span>
                </label>
                <label>
                  <input type="radio" name="payment" value="netbanking" />
                  <span>Net Banking</span>
                </label>
              </div>
            </div>

            <button className="proceed-btn">
              Proceed to Payment
            </button>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="order-details">
              <p className="course-name">{course.title}</p>
              <p className="course-type">{course.type}</p>

              {instructor && (
                <p className="instructor">
                  Instructor: <strong>{instructor.name}</strong>
                </p>
              )}

              <hr />

              <div className="price-row">
                <span>Course Price</span>
                <span>{course.price}</span>
              </div>
              
              <div className="price-row">
                <span>GST (18%)</span>
                <span>Included</span>
              </div>

              <div className="price-row total">
                <span>Total Amount</span>
                <span>{course.price}</span>
              </div>

              <p className="secure-text">
                🔒 Secure payment • 100% safe checkout
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BuyNow;
