cmake_minimum_required(VERSION 3.22)

project("whisper_jni")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Path to whisper.cpp (sibling to android directory)
set(WHISPER_CPP_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../../../whisper.cpp)

# Disable building examples/tests when building as subdirectory
set(WHISPER_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(WHISPER_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(WHISPER_BUILD_SERVER OFF CACHE BOOL "" FORCE)

# Include whisper.cpp as subdirectory
add_subdirectory(${WHISPER_CPP_DIR} ${CMAKE_CURRENT_BINARY_DIR}/whisper)

add_library(whisper_jni SHARED
    whisper_jni.cpp
)

target_include_directories(whisper_jni PRIVATE
    ${WHISPER_CPP_DIR}/include
)

target_link_libraries(whisper_jni
    whisper
    log
)