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
  
  type AppointmentScheduledEmailProps = {
    userName: string;
    scheduledDate: string;
    scheduledTime: string;
  };
  
  export default function AppointmentScheduledEmail({
    userName,
    scheduledDate,
    scheduledTime,
  }: AppointmentScheduledEmailProps) {
    return (
      <Html>
        <Head />
  
        <Preview>
          Your NourishWell appointment has been scheduled
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
              Appointment Scheduled
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
              Congratulations! Your appointment has been scheduled successfully.
            </Text>
  
            <Section>
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Date: {scheduledDate}
              </Text>
  
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Time: {scheduledTime}
              </Text>
            </Section>
  
            <Text
              style={{
                color: "#374151",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              You will receive a phone call from our team at the scheduled time.
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