import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class EmailService:
    @staticmethod
    def send_order_confirmation(customer_email, customer_name, order_number, items, total_amount):
        """Send order confirmation email to customer"""
        
        # Email configuration from environment variables
        mail_username = os.getenv('MAIL_USERNAME')
        mail_password = os.getenv('MAIL_PASSWORD')
        mail_from = os.getenv('MAIL_FROM')
        mail_from_name = os.getenv('MAIL_FROM_NAME', 'Sharp Lab')
        mail_server = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
        mail_port = int(os.getenv('MAIL_PORT', 587))
        
        if not mail_username or not mail_password:
            print("Email credentials not configured")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'Order Confirmation - {order_number}'
            msg['From'] = f'{mail_from_name} <{mail_from}>'
            msg['To'] = customer_email
            
            # Create HTML email body
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #ea580c; color: white; padding: 20px; text-align: center; }}
                    .content {{ background-color: #f9fafb; padding: 30px; }}
                    .order-details {{ background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }}
                    .item {{ padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
                    .total {{ font-size: 20px; font-weight: bold; color: #ea580c; margin-top: 20px; }}
                    .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Sharp Lab by Owais</h1>
                        <p>Order Confirmation</p>
                    </div>
                    
                    <div class="content">
                        <h2>Thank you for your order, {customer_name}!</h2>
                        <p>We've received your order and will contact you shortly to confirm the delivery details.</p>
                        
                        <div class="order-details">
                            <h3>Order Number: #{order_number}</h3>
                            <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
                            
                            <h4>Order Items:</h4>
            """
            
            # Add items to email
            for item in items:
                price = float(item['price']) if isinstance(item['price'], str) else item['price']
                quantity = int(item['quantity'])
                subtotal = price * quantity
                
                html_body += f"""
                            <div class="item">
                                <strong>{item['name']}</strong><br>
                                Quantity: {quantity} × RS {price:.2f} = RS {subtotal:.2f} PKR
                            </div>
                """
            
            html_body += f"""
                            <div class="total">
                                Total Amount: RS {total_amount:.2f} PKR
                            </div>
                        </div>
                        
                        <h3>What's Next?</h3>
                        <ul>
                            <li>We'll call you to confirm your order details</li>
                            <li>Your order will be carefully packaged</li>
                            <li>Delivery within 3-5 business days</li>
                            <li>Pay cash when you receive your order</li>
                        </ul>
                        
                        <p>If you have any questions, feel free to contact us.</p>
                    </div>
                    
                    <div class="footer">
                        <p>Sharp Lab by Owais - Premium Knives</p>
                        <p>This is an automated email. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Attach HTML body
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(mail_server, mail_port) as server:
                server.starttls()
                server.login(mail_username, mail_password)
                server.send_message(msg)
            
            print(f"Order confirmation email sent to {customer_email}")
            return True
            
        except Exception as e:
            print(f"Error sending email: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    @staticmethod
    def send_admin_notification(order_number, customer_name, customer_phone, customer_email, items, total_amount, delivery_address, city):
        """Send order notification to admin"""
        
        mail_username = os.getenv('MAIL_USERNAME')
        mail_password = os.getenv('MAIL_PASSWORD')
        mail_from = os.getenv('MAIL_FROM')
        mail_from_name = os.getenv('MAIL_FROM_NAME', 'Sharp Lab')
        mail_server = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
        mail_port = int(os.getenv('MAIL_PORT', 587))
        admin_email = os.getenv('ADMIN_EMAIL', mail_from)  # Send to same email if no admin email set
        
        if not mail_username or not mail_password:
            return False
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'New Order Received - {order_number}'
            msg['From'] = f'{mail_from_name} <{mail_from}>'
            msg['To'] = admin_email
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #1f2937; color: white; padding: 20px; }}
                    .content {{ background-color: #f9fafb; padding: 30px; }}
                    .section {{ background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }}
                    .item {{ padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
                    .total {{ font-size: 20px; font-weight: bold; color: #ea580c; margin-top: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 New Order Received!</h1>
                        <p>Order #{order_number}</p>
                    </div>
                    
                    <div class="content">
                        <div class="section">
                            <h3>Customer Information</h3>
                            <p><strong>Name:</strong> {customer_name}</p>
                            <p><strong>Phone:</strong> {customer_phone}</p>
                            <p><strong>Email:</strong> {customer_email}</p>
                            <p><strong>Address:</strong> {delivery_address}</p>
                            <p><strong>City:</strong> {city}</p>
                        </div>
                        
                        <div class="section">
                            <h3>Order Items</h3>
            """
            
            for item in items:
                price = float(item['price']) if isinstance(item['price'], str) else item['price']
                quantity = int(item['quantity'])
                subtotal = price * quantity
                
                html_body += f"""
                            <div class="item">
                                <strong>{item['name']}</strong><br>
                                Quantity: {quantity} × RS {price:.2f} = RS {subtotal:.2f} PKR
                            </div>
                """
            
            html_body += f"""
                            <div class="total">
                                Total Amount: RS {total_amount:.2f} PKR
                            </div>
                        </div>
                        
                        <div class="section">
                            <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
                            <p style="color: #ea580c; font-weight: bold;">⚠️ Please contact the customer to confirm the order!</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
            with smtplib.SMTP(mail_server, mail_port) as server:
                server.starttls()
                server.login(mail_username, mail_password)
                server.send_message(msg)
            
            print(f"Admin notification sent to {admin_email}")
            return True
            
        except Exception as e:
            print(f"Error sending admin notification: {e}")
            return False
