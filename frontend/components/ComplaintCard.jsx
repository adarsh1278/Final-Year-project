'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const statusIcons = {
  open: <Clock className="h-4 w-4" />,
  inProgress: <AlertCircle className="h-4 w-4" />,
  closed: <CheckCircle className="h-4 w-4" />
};

const statusColors = {
  open: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  inProgress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
};

const ComplaintCard = ({ complaint, isDepartment = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{complaint.title}</CardTitle>
              <CardDescription>
                {complaint.complaintNumber}
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={cn("flex items-center gap-1", statusColors[complaint.status])}
            >
              {statusIcons[complaint.status]}
              <span>{complaint.status}</span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-2 flex justify-between items-center text-sm text-muted-foreground">
            <div>Department: <span className="font-medium text-foreground">{complaint.department}</span></div>
            <div>Filed: <span className="font-medium text-foreground">{formatDate(complaint.createdAt)}</span></div>
          </div>
          
          <p className="text-sm line-clamp-2">{complaint.description}</p>
          
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: isExpanded ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {complaint.responseFromDept && (
              <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                <div className="font-medium mb-1">Response:</div>
                <p>{complaint.responseFromDept}</p>
              </div>
            )}
            
            {complaint.additionalDetails && Object.keys(complaint.additionalDetails).length > 0 && (
              <div className="mt-4">
                <div className="font-medium mb-1 text-sm">Additional Details:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(complaint.additionalDetails).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-muted-foreground">{key}:</span>
                      <span>{value.toString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleExpand}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
          
          <Link 
            href={`/track/${complaint.complaintNumber}`}
            passHref
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              Track
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ComplaintCard;