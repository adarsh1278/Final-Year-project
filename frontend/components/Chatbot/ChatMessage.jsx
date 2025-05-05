'use client';

import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatMessage = ({ message, isBot }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full mb-4",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div className={cn(
        "flex max-w-[80%]",
        isBot ? "flex-row" : "flex-row-reverse"
      )}>
        <div className={cn(
          "flex items-center justify-center h-8 w-8 rounded-full mr-2",
          isBot ? "bg-primary/10" : "bg-primary/10 ml-2"
        )}>
          {isBot ? 
            <Bot className="h-4 w-4 text-primary" /> : 
            <User className="h-4 w-4 text-primary" />
          }
        </div>
        
        <div className={cn(
          "rounded-lg px-4 py-2 shadow-sm",
          isBot 
            ? "bg-secondary text-secondary-foreground rounded-tl-none" 
            : "bg-primary text-primary-foreground rounded-tr-none"
        )}>
          <p className="text-sm">{message.text}</p>
          
          {message.options && message.options.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => option.onClick && option.onClick()}
                  className="bg-background text-foreground text-xs px-2 py-1 rounded-full hover:bg-muted transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;