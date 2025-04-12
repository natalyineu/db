type MessageType = 'success' | 'error';

type MessageDisplayProps = {
  message: { 
    type: MessageType; 
    text: string 
  } | null;
};

export default function MessageDisplay({ message }: MessageDisplayProps) {
  if (!message) {
    return null;
  }
  
  const classes = {
    success: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800'
  };
  
  return (
    <div className={`p-4 rounded-md ${classes[message.type]}`}>
      {message.text}
    </div>
  );
} 