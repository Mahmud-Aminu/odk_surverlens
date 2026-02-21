import React, { Component, ErrorInfo, ReactNode } from "react";
import { Text, View } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, color: "red", marginBottom: 10 }}>
            Something went wrong!
          </Text>
          <Text style={{ color: "#666", textAlign: "center" }}>
            {this.state.error?.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
