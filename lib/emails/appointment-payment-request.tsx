import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
  } from "@react-email/components";
  
  type AppointmentPaymentEmailProps = {
    userName: string;
    amount: number;
  };
  
  export default function AppointmentPaymentEmail({
    userName,
    amount,
  }: AppointmentPaymentEmailProps) {
    return (
      <Html>
        <Head />
  
        <Preview>
          Appointment payment request from NourishWell
        </Preview>
  
        <Body
          style={{
            backgroundColor: "#f6f9f5",
            fontFamily: "Arial, sans-serif",
            padding: "20px",
          }}
        >
          <Container
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <Heading
              style={{
                color: "#1f3b2d",
                marginBottom: "20px",
              }}
            >
              Appointment Request Verified
            </Heading>
  
            <Text
              style={{
                color: "#374151",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Hi {userName},
            </Text>
  
            <Text
              style={{
                color: "#374151",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Your appointment request has been reviewed and approved by the nutritionist.
            </Text>
  
            <Text
              style={{
                color: "#374151",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Please complete the payment of ₹{amount} to proceed with scheduling your consultation.
            </Text>
  
            <Hr />
  
            <Text
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              NourishWell
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }