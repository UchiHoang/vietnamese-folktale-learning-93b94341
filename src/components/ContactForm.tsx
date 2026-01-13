import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { motion } from "framer-motion";
import { Send, MessageCircle, Mail, User, FileText } from "lucide-react";

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Vui lòng nhập họ tên" }).max(100, { message: "Họ tên không được quá 100 ký tự" }),
  email: z.string().trim().email({ message: "Email không hợp lệ" }).max(255, { message: "Email không được quá 255 ký tự" }),
  subject: z.string().trim().min(1, { message: "Vui lòng nhập chủ đề" }).max(200, { message: "Chủ đề không được quá 200 ký tự" }),
  message: z.string().trim().min(1, { message: "Vui lòng nhập tin nhắn" }).max(1000, { message: "Tin nhắn không được quá 1000 ký tự" })
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof ContactFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Gửi thành công!",
        description: "Chúng mình sẽ liên hệ với bạn sớm nhất có thể.",
      });
      
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description: "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1 }
  };

  return (
    <section id="contact" className="py-16 md:py-20 bg-gradient-to-b from-background to-secondary/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
        
        {/* Floating icons */}
        <motion.div
          className="absolute top-1/4 right-1/4 text-3xl opacity-10"
          animate={{ y: [-10, 10, -10], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          ✉️
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 left-1/5 text-2xl opacity-10"
          animate={{ y: [10, -10, 10], rotate: [0, -15, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        >
          💬
        </motion.div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="text-center mb-12 space-y-4"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MessageCircle className="h-4 w-4" />
              </motion.div>
              <span>Liên hệ</span>
            </motion.div>
            
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              Liên hệ với chúng mình
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Có câu hỏi hoặc cần hỗ trợ? Chúng mình luôn sẵn sàng giúp đỡ bạn!
            </motion.p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="bg-card border-4 border-accent rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
              <motion.div
                variants={inputVariants}
                whileFocus="focus"
              >
                <label htmlFor="name" className="flex items-center gap-2 font-semibold mb-2">
                  <User className="h-4 w-4 text-primary" />
                  Họ và tên
                </label>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Nhập họ tên của bạn"
                    value={formData.name}
                    onChange={handleChange}
                    className={`border-2 transition-all duration-300 ${errors.name ? 'border-destructive' : 'border-secondary hover:border-primary/50'} focus:border-primary focus:ring-2 focus:ring-primary/20`}
                    disabled={isSubmitting}
                  />
                </motion.div>
                {errors.name && (
                  <motion.p 
                    className="text-sm text-destructive mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={inputVariants} whileFocus="focus">
                <label htmlFor="email" className="flex items-center gap-2 font-semibold mb-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </label>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`border-2 transition-all duration-300 ${errors.email ? 'border-destructive' : 'border-secondary hover:border-primary/50'} focus:border-primary focus:ring-2 focus:ring-primary/20`}
                    disabled={isSubmitting}
                  />
                </motion.div>
                {errors.email && (
                  <motion.p 
                    className="text-sm text-destructive mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>
            </div>

            <motion.div className="mb-6 relative z-10" variants={inputVariants} whileFocus="focus">
              <label htmlFor="subject" className="flex items-center gap-2 font-semibold mb-2">
                <FileText className="h-4 w-4 text-primary" />
                Chủ đề
              </label>
              <motion.div whileHover={{ scale: 1.01 }}>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Bạn muốn hỏi về điều gì?"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`border-2 transition-all duration-300 ${errors.subject ? 'border-destructive' : 'border-secondary hover:border-primary/50'} focus:border-primary focus:ring-2 focus:ring-primary/20`}
                  disabled={isSubmitting}
                />
              </motion.div>
              {errors.subject && (
                <motion.p 
                  className="text-sm text-destructive mt-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.subject}
                </motion.p>
              )}
            </motion.div>

            <motion.div className="mb-6 relative z-10" variants={inputVariants} whileFocus="focus">
              <label htmlFor="message" className="flex items-center gap-2 font-semibold mb-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                Tin nhắn
              </label>
              <motion.div whileHover={{ scale: 1.005 }}>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Viết tin nhắn của bạn ở đây..."
                  value={formData.message}
                  onChange={handleChange}
                  className={`border-2 min-h-[150px] transition-all duration-300 ${errors.message ? 'border-destructive' : 'border-secondary hover:border-primary/50'} focus:border-primary focus:ring-2 focus:ring-primary/20`}
                  disabled={isSubmitting}
                />
              </motion.div>
              {errors.message && (
                <motion.p 
                  className="text-sm text-destructive mt-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative z-10"
            >
              <Button 
                type="submit" 
                size="lg" 
                className="w-full md:w-auto px-8 group relative overflow-hidden"
                disabled={isSubmitting}
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                {isSubmitting ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⏳
                  </motion.span>
                ) : (
                  <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                )}
                {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
              </Button>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
