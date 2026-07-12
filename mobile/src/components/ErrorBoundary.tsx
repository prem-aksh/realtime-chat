import React, {Component, type ErrorInfo, type ReactNode} from "react";
import {StyleSheet, Text, View} from "react-native";

export class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};
  static getDerivedStateFromError(): {hasError: boolean} { return {hasError: true}; }
  componentDidCatch(error: Error, info: ErrorInfo): void { console.error("Mobile UI error", error, info.componentStack); }
  render(): ReactNode { return this.state.hasError ? <View style={styles.container}><Text style={styles.title}>Something went wrong</Text><Text style={styles.text}>Restart the app to try again.</Text></View> : this.props.children; }
}
const styles = StyleSheet.create({container: {flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#f8fafc"}, title: {fontSize: 22, fontWeight: "700", color: "#0f172a"}, text: {marginTop: 8, color: "#475569"}});
