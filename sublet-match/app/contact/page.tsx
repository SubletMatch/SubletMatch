"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Building } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just simulate a submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12 md:py-24">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Contact Us
            </h1>
            <p className="mt-4 text-muted-foreground">
              Have questions about LeaseLink? We're here to help! Reach out to
              us through any of the following channels.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">support@leaselink.com</p>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-muted-foreground">(555) 123-4567</p>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday, 9am - 5pm EST
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Office Location</h3>
                <p className="text-muted-foreground">
                  123 University Ave
                  <br />
                  Madison, WI 53715
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">LeaseLink</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Making subletting easier for students and property owners since
              2024
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <Input
                id="subject"
                placeholder="What's this about?"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Your message..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                className="min-h-[150px]"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
